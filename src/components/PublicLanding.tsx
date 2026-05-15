import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Heart, 
  Coins, 
  Building2, 
  ArrowRight, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Phone,
  Mail,
  PlayCircle,
  Megaphone,
  Plus,
  LayoutDashboard,
  Search,
  GraduationCap,
  X,
  User,
  Info,
  CheckCircle2,
  CreditCard,
  AlertCircle,
  ShoppingBag,
  Package,
  Minus,
  Check,
  Tag
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PaymentDialog } from './PaymentDialog';
import { Link } from 'react-router-dom';
import { Announcement, Church } from '../lib/store';
import { TrainingRegistrationDialog } from './TrainingRegistrationDialog';
import { AnnouncementDetailDialog } from './AnnouncementDetailDialog';
import { ProjectContributionDialog } from './ProjectContributionDialog';

export function PublicLanding() {
  const navigate = useNavigate();
  const { 
    announcements, 
    events, 
    services, 
    churchProjects, 
    isAuthenticated, 
    churches, 
    contributionTypes, 
    departmentActivities, 
    departments,
    funeralCases,
    courses,
    members
  } = useStore();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [isChurchSelectorOpen, setIsChurchSelectorOpen] = useState(false);
  const [churchSearchTerm, setChurchSearchTerm] = useState('');
  const [listChurchSearchTerm, setListChurchSearchTerm] = useState('');
  const [selectedChurchDetailsId, setSelectedChurchDetailsId] = useState<string | null>(null);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [selectedAnnouncementDetail, setSelectedAnnouncementDetail] = useState<Announcement | null>(null);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState<any>(null);
  const [merchQuantities, setMerchQuantities] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isOrderingInReg, setIsOrderingInReg] = useState(false);
  const [selectedTrainingForRegistration, setSelectedTrainingForRegistration] = useState<any>(null);
  const [selectedProjectContribution, setSelectedProjectContribution] = useState<any>(null);
  const [registrationFormData, setRegistrationFormData] = useState({
    lastName: '',
    firstName: '',
    sex: '',
    phone: '',
    address: '',
    isMember: false,
    churchName: '',
    department: '',
    participationType: 'simple',
    paymentMethod: 'orange_money',
    specialNeeds: '',
    healthIssues: '',
    comments: '',
    confirmAccuracy: false,
    acceptTerms: false
  });
  const [isDepartmentReadOnly, setIsDepartmentReadOnly] = useState(false);

  // Auto-fill church and check for member status
  useEffect(() => {
    if (selectedEventForRegistration) {
      const eventChurch = churches.find(c => c.id === selectedEventForRegistration.churchId);
      if (registrationFormData.isMember && eventChurch && !registrationFormData.churchName) {
        setRegistrationFormData(prev => ({ ...prev, churchName: eventChurch.name }));
      }
    }
  }, [registrationFormData.isMember, selectedEventForRegistration, churches]);

  // Check name for member roles/departments
  useEffect(() => {
    if (registrationFormData.firstName && registrationFormData.lastName && registrationFormData.isMember) {
      const foundMember = members.find(m => 
        m.firstName.toLowerCase().trim() === registrationFormData.firstName.trim().toLowerCase() && 
        m.lastName.toLowerCase().trim() === registrationFormData.lastName.trim().toLowerCase()
      );

      if (foundMember) {
        let statusText = 'Membre';
        
        // 1. If has a specific role (Pasteur, Diacre, etc.)
        if (foundMember.role) {
          statusText = foundMember.role;
        } 
        // 2. Else if has a department name
        else if (foundMember.departmentId) {
          const dept = departments.find(d => d.id === foundMember.departmentId);
          if (dept) statusText = dept.name;
        }

        // 3. If leader, append "Responsable" if it's not already a high role
        if (foundMember.engagementLevel === 'leader' && !foundMember.role) {
          statusText = statusText === 'Membre' ? 'Responsable' : `${statusText} - Responsable`;
        }

        setRegistrationFormData(prev => ({ ...prev, department: statusText }));
        setIsDepartmentReadOnly(true);
      } else {
        // Not found in database as member
        setIsDepartmentReadOnly(false);
      }
    } else {
      setIsDepartmentReadOnly(false);
    }
  }, [registrationFormData.firstName, registrationFormData.lastName, registrationFormData.isMember, members, departments]);
  const [supportSelection, setSupportSelection] = useState<{
    churchId: string | null;
    type: 'donation' | 'contribution' | 'project' | null;
  }>({ churchId: null, type: null });
  const [paymentData, setPaymentData] = useState<{title: string, type: 'donation' | 'contribution' | 'event' | 'project', amount?: number, targetId?: string}>({
    title: 'Faire un don',
    type: 'donation'
  });

  const [rotationTick, setRotationTick] = useState(0);

  // Pause rotation if any dialog is open
  const isAnyDialogOpen = !!selectedAnnouncementDetail || 
    !!selectedProjectContribution || 
    !!selectedTrainingForRegistration || 
    !!selectedEventForRegistration || 
    paymentOpen || 
    isChurchSelectorOpen || 
    !!fullscreenImageUrl;

  useEffect(() => {
    if (isAnyDialogOpen) return;

    const interval = setInterval(() => {
      setRotationTick(prev => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, [isAnyDialogOpen]);

  const activeAnnouncements = useMemo(() => {
    const activeOnes = announcements.filter(a => a.status === 'active');
    if (activeOnes.length <= 6) return activeOnes;
    const start = (rotationTick * 2) % activeOnes.length; // Shift by 2 each time for variety
    return [...activeOnes, ...activeOnes].slice(start, start + 6);
  }, [announcements, rotationTick]);

  const combinedEvents = useMemo(() => {
    // Sort events by date initially to ensure newest/upcoming are processed correctly
    const publishedEvents = [...events]
      .filter(e => e.isPublished && e.status !== 'completed')
      .map(e => ({
        ...e,
        isDepartment: false,
        displayDate: e.startDate,
        displayTitle: e.name,
        displayLocation: e.location,
        displayImage: e.bannerUrl
      }));

    const publishedDeptActs = (departmentActivities || [])
      .filter(a => a.isPublished)
      .map(a => {
        const dept = departments.find(d => d.id === a.departmentId);
        return {
          ...a,
          isDepartment: true,
          churchId: dept?.churchId,
          displayDate: a.date,
          displayTitle: `${dept?.name || 'Département'}: ${a.title}`,
          displayLocation: a.location,
          displayImage: a.imageUrl || (dept as any)?.logoUrl
        };
      });

    const all = [...publishedEvents, ...publishedDeptActs]
      .sort((a, b) => {
        try {
          return parseISO(a.displayDate).getTime() - parseISO(b.displayDate).getTime();
        } catch (e) {
          return 0;
        }
      });
    
    // Priority: ensure at least the next upcoming events are shown first if not many
    if (all.length <= 3) return all;
    
    // Rotation logic - only rotate if there are more than 3 events to keep it steady
    if (all.length <= 6) return all;
    
    const start = (rotationTick) % all.length; 
    return [...all, ...all].slice(start, start + 6);
  }, [events, departmentActivities, departments, churches, rotationTick]);

  const featuredProjects = useMemo(() => {
    const projects = churchProjects.filter(p => p.status === 'ongoing' || p.status === 'pending');
    if (projects.length <= 6) return projects;
    const start = rotationTick % projects.length;
    return [...projects, ...projects].slice(start, start + 6);
  }, [churchProjects, rotationTick]);
  
  const allPublishedTrainings = useMemo(() => {
    const trainings: any[] = [];
    churches.forEach(church => {
      church.publishedTrainings?.forEach(t => {
        trainings.push({ 
          ...t, 
          churchName: church.name,
          duration: "12 séances (3 mois)",
          level: "Ouvert à tous",
          cost: Math.random() > 0.5 ? 10000 : 0,
          capacity: 100,
          registeredCount: Math.floor(Math.random() * 80)
        });
      });
    });
    
    if (trainings.length <= 6) return trainings;
    const start = (rotationTick * 2) % trainings.length;
    return [...trainings, ...trainings].slice(start, start + 6);
  }, [churches, rotationTick]);

  const rotatedChurches = useMemo(() => {
    if (churches.length <= 6) return churches;
    const start = rotationTick % churches.length;
    return [...churches, ...churches].slice(start, start + 6);
  }, [churches, rotationTick]);

  const publishedServices = useMemo(() => {
    return (services || [])
      .filter(s => s.isPublished)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [services]);

  const nextService = publishedServices[0];

  const handleContribute = (title: string, type: 'donation' | 'contribution' | 'event' | 'project', amount?: number, targetId?: string) => {
    setPaymentData({ title, type, amount, targetId });
    setPaymentOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1600&q=80" 
            alt="Church Hero" 
            className="w-full h-full object-cover brightness-50"
          />
        </div>
        
        <div className="absolute top-0 w-full p-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-church-gold rounded-xl flex items-center justify-center text-white font-bold text-xl">
              G
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight">Grace-Connect</h1>
          </div>
          <Link to={isAuthenticated ? "/dashboard" : "/login"}>
            <Button className="bg-church-green hover:bg-emerald-700 text-white gap-2 rounded-full px-6 font-bold shadow-lg shadow-church-green/20 border-none transition-all">
              {isAuthenticated ? (
                <>
                  <LayoutDashboard className="w-4 h-4" />
                  Espace Gestion
                </>
              ) : (
                "Connexion/Inscription"
              )}
            </Button>
          </Link>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-church-gold font-medium uppercase tracking-[0.3em] mb-4">Bienvenue à la maison</p>
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
              Célebrer Dieu, Servir l'Afrique
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mt-6">
              Une communauté dynamique dédiée à la transformation spirituelle et sociale de notre continent.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button size="lg" className="bg-church-gold hover:bg-amber-600 text-white h-14 px-8 rounded-full shadow-xl shadow-church-gold/20" onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}>
              Voir les événements
            </Button>
            <Button size="lg" className="bg-white hover:bg-slate-50 text-slate-900 h-14 px-8 rounded-full shadow-xl" onClick={() => setIsChurchSelectorOpen(true)}>
              Faire un don 💰
            </Button>
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white h-14 px-8 rounded-full shadow-xl shadow-red-600/20 transition-all border-none font-bold">
              Nous rejoindre
            </Button>
            <Link to="/parcours">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white h-14 px-8 rounded-full shadow-xl shadow-violet-600/20 transition-all border-none font-bold">
                Documents & Éditions
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-2 text-white/60">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <ArrowRight className="w-4 h-4 rotate-90" />
        </div>
      </section>

      {/* 2. ANNONCES SECTION */}
      {activeAnnouncements.length > 0 && (
        <section className="py-24 bg-slate-50 border-y border-slate-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-church-gold/10 text-church-gold rounded-2xl">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-bold text-slate-900">Annonces importantes</h3>
                  <p className="text-slate-500">Restez informé de la vie de notre église.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeAnnouncements.map((ann, idx) => {
                const church = churches.find(c => c.id === ann.churchId);
                return (
                  <motion.div
                    key={ann.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="border-none shadow-sm h-full hover:shadow-md transition-all overflow-hidden group">
                      <div className="h-48 overflow-hidden bg-slate-100 flex items-center justify-center">
                        <img 
                          src={ann.imageUrl || "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=800&q=80"} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          alt={ann.title} 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-6 flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                          {ann.isUrgent && <Badge className="bg-red-500 text-white border-none">Urgent 🔴</Badge>}
                          <Badge className="bg-emerald-100 text-emerald-700 border-none">Nouveau 🟢</Badge>
                        </div>
                        {church && (
                          <p className="text-church-gold text-xs font-bold uppercase tracking-wider mb-1">{church.name}</p>
                        )}
                        <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-church-gold transition-colors">{ann.title}</h4>
                        <p className="text-slate-600 line-clamp-3 mb-6 flex-1">{ann.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <span className="text-xs text-slate-400">{format(parseISO(ann.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
                          <div className="flex items-center gap-3">
                            <Button 
                              size="sm" 
                              className="rounded-xl h-8 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEventForRegistration({
                                  ...ann,
                                  type: 'announcement',
                                  displayTitle: ann.title,
                                  displayDate: ann.createdAt,
                                  displayLocation: "À confirmer",
                                  fee: 0,
                                  churchId: ann.churchId
                                });
                              }}
                            >
                              {ann.actionLink?.label || "Participer"}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-church-gold font-bold p-0 hover:bg-transparent text-[10px] uppercase"
                              onClick={() => setSelectedAnnouncementDetail(ann)}
                            >
                              Détails <ChevronRight className="w-3 h-3 ml-0.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <Button 
                size="lg" 
                className="bg-slate-900 hover:bg-black text-white px-10 py-7 rounded-2xl font-bold shadow-2xl flex items-center gap-3 mx-auto transition-all hover:scale-105"
                onClick={() => navigate('/annonces')}
              >
                Voir toutes les Annonces Importantes <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* RECHERCHE D'ÉGLISE */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Trouver mon Église Locale</h2>
            <p className="text-slate-500 mb-8">Recherchez une église pour découvrir ses prochains cultes, événements et programmes de formation.</p>
            
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-church-gold" />
              <Input 
                placeholder="Nom de l'église, ville ou pays..." 
                className="pl-16 py-8 rounded-[24px] border-2 border-church-gold/20 focus:border-church-gold bg-white shadow-2xl text-xl font-medium"
                value={listChurchSearchTerm}
                onChange={(e) => setListChurchSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {listChurchSearchTerm && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h3 className="text-sm font-bold text-church-gold uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <span className="w-12 h-[1px] bg-church-gold"></span>
                Résultats de recherche pour "{listChurchSearchTerm}"
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {churches
                  .filter(c => 
                    c.name.toLowerCase().includes(listChurchSearchTerm.toLowerCase()) || 
                    c.city.toLowerCase().includes(listChurchSearchTerm.toLowerCase()) ||
                    c.country.toLowerCase().includes(listChurchSearchTerm.toLowerCase())
                  )
                  .map((church) => {
                    const churchEvents = events.filter(e => e.churchId === church.id && e.isPublished).slice(0, 2);
                    const churchServices = services.filter(s => s.churchId === church.id && s.isPublished).slice(0, 1);
                    
                    return (
                      <motion.div
                        key={church.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[32px] p-8 shadow-2xl border border-church-gold/10 relative overflow-hidden group hover:border-church-gold/30 transition-all"
                      >
                        <div className="absolute top-0 right-0 p-4">
                          <Badge className="bg-church-gold/10 text-church-gold border-none">Église Active</Badge>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="text-2xl font-bold text-slate-900 mb-1">{church.name}</h4>
                          <p className="text-slate-500 text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-church-gold" /> {church.city}, {church.country}
                          </p>
                        </div>

                        <div className="space-y-5 mb-8">
                          {churchEvents.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Événements Spéciaux
                              </p>
                              {churchEvents.map(e => (
                                <div key={e.id} className="text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 truncate">
                                  {e.name}
                                </div>
                              ))}
                            </div>
                          )}
                          {churchServices.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Prochain Culte
                              </p>
                              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100/50 truncate">
                                {churchServices[0].theme || "Culte de Célébration"} • {format(parseISO(churchServices[0].date), 'dd MMM', { locale: fr })}
                              </div>
                            </div>
                          )}
                        </div>

                        <Button 
                          className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl py-7 font-bold shadow-xl flex items-center justify-center gap-2"
                          onClick={() => setSelectedChurchDetailsId(church.id)}
                        >
                          Voir tout <ArrowRight className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    );
                  })}
              </div>
              {churches.filter(c => 
                c.name.toLowerCase().includes(listChurchSearchTerm.toLowerCase()) || 
                c.city.toLowerCase().includes(listChurchSearchTerm.toLowerCase()) ||
                c.country.toLowerCase().includes(listChurchSearchTerm.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-16 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                  <p className="text-slate-400 text-lg">Aucune église ne correspond à votre recherche actuelle.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* 3. ÉVÉNEMENTS SECTION */}
      <section id="events" className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Événements à venir</h2>
            <p className="text-slate-500">Participez à nos rassemblements et activités spéciales.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {combinedEvents.map((evt, idx) => {
              const church = churches.find(c => c.id === evt.churchId);
              return (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer"
                >
                  <div className="relative rounded-3xl overflow-hidden aspect-[4/5] mb-6">
                    <img 
                      src={evt.displayImage || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80"} 
                      alt={evt.displayTitle} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-zoom-in"
                      onClick={() => setFullscreenImageUrl(evt.displayImage || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl text-center min-w-[60px]">
                      <span className="block text-2xl font-bold text-slate-900">{format(parseISO(evt.displayDate), 'dd')}</span>
                      <span className="block text-[10px] uppercase font-bold text-church-gold">{format(parseISO(evt.displayDate), 'MMM', { locale: fr })}</span>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      {church && (
                        <p className="text-church-gold text-xs font-bold uppercase tracking-wider mb-1">{church.name}</p>
                      )}
                      <h4 className="text-2xl font-bold mb-2">{evt.displayTitle}</h4>
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{evt.displayLocation}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold h-11 transition-all shadow-lg shadow-red-600/20 shadow-none border-none"
                      onClick={() => setSelectedEventForRegistration(evt)}
                    >
                      Je participe
                    </Button>
                    {!evt.isDepartment && (
                      <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => handleContribute(`Inscription: ${evt.displayTitle}`, 'event', undefined, evt.id)}>Payer</Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Button 
              size="lg" 
              className="bg-slate-900 hover:bg-black text-white px-10 py-7 rounded-2xl font-bold shadow-2xl flex items-center gap-3 mx-auto transition-all hover:scale-105"
              onClick={() => navigate('/evenements')}
            >
              Voir tous les Événements à Venir <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 4. PROCHAINS CULTES SECTION */}
      {publishedServices.length > 0 && (
        <section id="services" className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Cultes & Célébrations</h2>
              <p className="text-slate-500">Retrouvez les prochains cultes de nos différentes églises.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {publishedServices.map((service, idx) => {
                const church = churches.find(c => c.id === service.churchId);
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col h-full">
                      <div className="relative aspect-video overflow-hidden">
                        <img 
                          src={service.imageUrl || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800&q=80"} 
                          alt={service.theme || "Culte"} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                          onClick={() => setFullscreenImageUrl(service.imageUrl || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800&q=80")}
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-church-gold uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.startTime}
                        </div>
                        {service.status === 'live' && (
                          <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold animate-pulse uppercase">
                            En Direct
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-3 h-3 text-church-gold" />
                          <span className="text-xs text-slate-500 font-medium">
                            {format(parseISO(service.date), 'dd MMMM yyyy', { locale: fr })}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-tight min-h-[3.5rem]">
                          {service.theme || "Culte de Célébration"}
                        </h4>
                        <div className="flex flex-col gap-4 mt-auto pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-church-gold/10 rounded-full flex items-center justify-center text-church-gold text-[10px] font-bold">
                              {church?.name.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-slate-700 truncate">{church?.name}</span>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-church-gold hover:bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl h-10 w-full"
                            onClick={() => setSelectedEventForRegistration(service)}
                          >
                            Je participe
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <Button 
                size="lg" 
                className="bg-slate-900 hover:bg-black text-white px-10 py-7 rounded-2xl font-bold shadow-2xl flex items-center gap-3 mx-auto transition-all hover:scale-105"
                onClick={() => navigate('/cultes')}
              >
                Voir tous les Cultes & Célébrations <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 5. DONS & COTISATIONS SECTION */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Soutenir Nos Églises</h2>
            <p className="text-slate-500">Choisissez votre église locale pour apporter votre contribution ou soutenir un projet spécifique.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rotatedChurches.map((church) => (
              <Card key={church.id} className="border-none shadow-sm hover:shadow-xl transition-all h-full overflow-hidden flex flex-col p-0 rounded-[32px]">
                <div className="h-40 bg-church-dark relative">
                  <img src={`https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800&q=80`} className="w-full h-full object-cover opacity-60" alt={church.name} />
                  {church.logoUrl && (
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center p-1.5 overflow-hidden border border-white/20">
                      <img src={church.logoUrl} className="w-full h-full object-cover rounded-lg" alt="" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-church-dark to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xl font-bold text-white">{church.name}</h4>
                      {church.type === 'central' && <Badge className="bg-church-gold text-white border-none text-[10px]">Centrale</Badge>}
                    </div>
                    <p className="text-white/60 text-xs flex items-center gap-1"><MapPin className="w-3 h-3"/> {church.city}, {church.country}</p>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2">{church.description}</p>
                  <div className="space-y-3 mt-auto">
                    <Button 
                      variant="outline" 
                      className="w-full justify-between h-12 rounded-xl group border-slate-200 hover:border-church-gold hover:text-church-gold text-slate-600 font-medium bg-white"
                      onClick={() => {
                        setSupportSelection({ churchId: church.id, type: 'donation' });
                        handleContribute(`Don pour ${church.name}`, 'donation', undefined, church.id);
                      }}
                    >
                      <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-blue-500" /> Faire un don</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between h-12 rounded-xl group border-slate-200 hover:border-church-gold hover:text-church-gold text-slate-600 font-medium bg-white"
                      onClick={() => setSupportSelection({ churchId: church.id, type: 'contribution' })}
                    >
                      <span className="flex items-center gap-2"><Coins className="w-4 h-4 text-amber-500" /> Payer une cotisation</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between h-12 rounded-xl group border-slate-200 hover:border-church-gold hover:text-church-gold text-slate-600 font-medium bg-white"
                      onClick={() => setSupportSelection({ churchId: church.id, type: 'project' })}
                    >
                      <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-purple-500" /> Soutenir un projet</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button 
              size="lg" 
              className="bg-slate-900 hover:bg-black text-white px-10 py-7 rounded-2xl font-bold shadow-2xl flex items-center gap-3 mx-auto transition-all hover:scale-105"
              onClick={() => navigate('/eglises')}
            >
              Voir toutes les Églises <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 6. PROJETS EN COURS */}
      <section id="projects" className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Bâtir l'Avenir</h2>
              <p className="text-slate-500">Nos projets de développement en cours.</p>
            </div>
            <div className="flex gap-4">
              <img src="https://images.unsplash.com/photo-1541829070764-84a7d30dee7a?w=100&q=80" className="w-20 h-14 rounded-xl object-cover grayscale opacity-50" alt="partner" />
              <img src="https://images.unsplash.com/photo-1541829070764-84a7d30dee7a?w=100&q=80" className="w-20 h-14 rounded-xl object-cover grayscale opacity-50" alt="partner" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProjects.map((project, idx) => {
              const currentAmount = 0; // In a real app, this would be computed from contributions
              const progress = Math.round((currentAmount / project.totalBudget) * 100);
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all">
                    <div className="h-48 relative overflow-hidden group cursor-zoom-in" onClick={() => setFullscreenImageUrl(project.imageUrl || `https://images.unsplash.com/photo-1518173946687-a4c8a98039f5?w=600&q=80`)}>
                      <img 
                        src={project.imageUrl || `https://images.unsplash.com/photo-1518173946687-a4c8a98039f5?w=600&q=80`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        alt="Project" 
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-church-gold">Phase d'exécution</div>
                    </div>
                    <div className="p-8">
                      {churches.find(c => c.id === project.churchId) && (
                        <div className="flex items-center gap-2 mb-2 text-church-gold font-bold text-xs uppercase tracking-widest">
                          <Building2 className="w-4 h-4" />
                          <span>{churches.find(c => c.id === project.churchId)?.name}</span>
                        </div>
                      )}
                      <h4 className="text-2xl font-bold mb-4">{project.name}</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Collecté: <span className="text-slate-900 font-bold">{currentAmount.toLocaleString()} FCFA</span></span>
                          <span className="text-church-gold font-bold">{progress}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className="h-full bg-church-gold" 
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Objectif: {project.totalBudget.toLocaleString()} FCFA</span>
                          <span>{currentAmount >= project.totalBudget ? 'Terminé' : `${(project.totalBudget - currentAmount).toLocaleString()} restant`}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-8 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg shadow-red-600/20 transition-all font-bold" 
                        onClick={() => setSelectedProjectContribution({
                          ...project,
                          title: project.name,
                          targetAmount: project.totalBudget,
                          currentAmount: 0 // As in the current logic
                        })}
                      >
                        Soutenir ce projet
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Button 
              size="lg" 
              className="bg-slate-900 hover:bg-black text-white px-10 py-7 rounded-2xl font-bold shadow-2xl flex items-center gap-3 mx-auto transition-all hover:scale-105"
              onClick={() => navigate('/projets')}
            >
              Voir tous les Projets <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* NOuvelle SECTION: FORMATIONS */}
      {allPublishedTrainings.length > 0 && (
        <section id="trainings" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div>
                <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Formations & Enseignements</h2>
                <p className="text-slate-500">Développez votre potentiel spirituel et pratique.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {allPublishedTrainings.map((training, idx) => (
                <motion.div
                  key={training.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-none shadow-sm hover:shadow-xl transition-all h-full overflow-hidden flex flex-col p-0 rounded-[28px] border border-slate-100 bg-white group">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img 
                        src={training.imageUrl || `https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt={training.title} 
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <Badge className="bg-blue-600 text-white border-none py-1.5 px-3 rounded-lg shadow-lg">Formation</Badge>
                        <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-slate-200 text-blue-800 font-bold text-[10px]">
                          {training.capacity - training.registeredCount} places restantes
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{training.churchName}</span>
                      </div>
                      <h4 className="text-lg font-bold mb-3 line-clamp-2 leading-tight min-h-[3rem] group-hover:text-blue-600 transition-colors">{training.title}</h4>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Instructeur: <span className="font-bold text-slate-700">{training.instructor}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>Début: <span className="font-bold text-slate-700">{format(parseISO(training.startDate), 'dd MMMM yyyy', { locale: fr })}</span></span>
                        </div>
                      </div>

                      <Button 
                        className="mt-auto w-full bg-slate-900 hover:bg-blue-600 text-white rounded-xl py-6 font-bold flex items-center justify-center gap-2 transition-all"
                        onClick={() => setSelectedTrainingForRegistration(training)}
                      >
                        Je participe <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Button 
                size="lg" 
                className="bg-slate-900 hover:bg-black text-white px-10 py-7 rounded-2xl font-bold shadow-2xl flex items-center gap-3 mx-auto transition-all hover:scale-105"
                onClick={() => navigate('/formations')}
              >
                Voir toutes les Formations <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 7. À PROPOS SECTION */}
      <section className="py-32 overflow-hidden bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <div className="aspect-square rounded-full border-2 border-church-gold/20 flex items-center justify-center p-12">
                <div className="w-full h-full rounded-full border-[12px] border-church-gold/40 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80" className="w-full h-full object-cover scale-110" alt="Vision" />
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-church-gold rounded-3xl p-6 flex flex-col justify-end">
                <span className="text-4xl font-serif font-bold mb-2">25+</span>
                <span className="text-sm font-medium leading-tight">Années de mission en Afrique</span>
              </div>
            </div>
            
            <div className="space-y-12">
              <div>
                <h2 className="text-5xl font-serif font-bold mb-6">Notre Vision & Mission</h2>
                <p className="text-lg text-white/60">
                  Nous sommes appelés à bâtir une église africaine mature, spirituellement forte et économiquement autonome, capable de transformer les nations par l'évangile de Jésus-Christ.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-church-gold rounded-xl flex items-center justify-center text-white">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold">Amour Fraternel</h4>
                  <p className="text-sm text-white/40">Cultiver une communauté où chaque membre est valorisé et soutenu.</p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold">Impact Social</h4>
                  <p className="text-sm text-white/40">Agir concrètement pour le bien-être et le développement de nos cités.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CONTACT SECTION */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-slate-50 rounded-[48px] overflow-hidden grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 md:p-20 space-y-12">
              <div>
                <h3 className="text-4xl font-serif font-bold mb-2">Contactez-nous</h3>
                <p className="text-slate-500">Nous sommes à votre écoute pour toute question ou demande de prière.</p>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-church-gold">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Localisation</p>
                    <p className="text-lg font-medium">Bndoukou, Côte d'Ivoire</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Téléphone</p>
                    <p className="text-lg font-medium">+225 07 07 07 07 07</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-lg font-medium">contact@ekklesia.africa</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 w-14 p-0">
                  <Facebook className="w-6 h-6" />
                </Button>
                <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl h-14 w-14 p-0">
                  <Instagram className="w-6 h-6" />
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-14 w-14 p-0">
                  <Youtube className="w-6 h-6" />
                </Button>
              </div>
            </div>
            
            <div className="h-full min-h-[400px] relative">
              <img src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80" alt="Map Placeholder" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-church-gold/20 mix-blend-overlay" />
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-slate-900 pt-20 pb-10 text-white/60 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-church-gold rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  G
                </div>
                <h4 className="text-xl font-serif font-bold text-white tracking-tight">Grace-Connect</h4>
              </div>
              <p className="text-sm italic">
                "Transformés pour transformer : telle est notre mission au cœur de l'Afrique et au-delà."
              </p>
            </div>

            <div className="space-y-6">
              <h5 className="text-white font-bold uppercase tracking-widest text-xs">Liens Rapides</h5>
              <ul className="space-y-4 text-sm">
                <li className="hover:text-church-gold cursor-pointer transition-colors">Notre vision</li>
                <li className="hover:text-church-gold cursor-pointer transition-colors">Les départements</li>
                <li className="hover:text-church-gold cursor-pointer transition-colors">Projets de construction</li>
                <li className="hover:text-church-gold cursor-pointer transition-colors">Faire un don</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-white font-bold uppercase tracking-widest text-xs">Ressources</h5>
              <ul className="space-y-4 text-sm">
                <li className="hover:text-church-gold cursor-pointer transition-colors">Bibliothèque PDF</li>
                <li className="hover:text-church-gold cursor-pointer transition-colors">Podcasts des cultes</li>
                <li className="hover:text-church-gold cursor-pointer transition-colors">Plan de formation</li>
                <li className="hover:text-church-gold cursor-pointer transition-colors">Journal d'annonces</li>
              </ul>
            </div>

            <div className="space-y-6 text-sm">
              <h5 className="text-white font-bold uppercase tracking-widest text-xs">Newsletter</h5>
              <p>Recevez nos inspirations hebdomadaires.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="votre@email.com" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-church-gold w-full" />
                <Button className="bg-church-gold text-white rounded-xl">Ok</Button>
              </div>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs uppercase tracking-widest">
            <p>&copy; 2026 Grace-Connect. Tous droits réservés.</p>
            <div className="flex gap-8">
              <span className="hover:text-white cursor-pointer transition-colors">Mentions Légales</span>
              <span className="hover:text-white cursor-pointer transition-colors">Confidentialité</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Payment Dialog */}
      <PaymentDialog 
        isOpen={paymentOpen} 
        onClose={() => setPaymentOpen(false)} 
        title={paymentData.title}
        type={paymentData.type}
        amount={paymentData.amount}
        targetId={paymentData.targetId}
      />

      {/* Announcement Details Dialog */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-none p-0">
          {selectedAnnouncement && (
            <div className="space-y-0">
              {selectedAnnouncement.imageUrl && (
                <div className="relative aspect-video w-full">
                  <img 
                    src={selectedAnnouncement.imageUrl} 
                    alt={selectedAnnouncement.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedAnnouncement.isUrgent && <Badge className="bg-red-500 text-white border-none shadow-lg">Urgent 🔴</Badge>}
                      <Badge className="bg-church-gold text-white border-none shadow-lg">
                        {churches.find(c => c.id === selectedAnnouncement.churchId)?.name || 'Annonce'}
                      </Badge>
                    </div>
                    <h2 className="text-3xl font-bold text-white leading-tight">{selectedAnnouncement.title}</h2>
                  </div>
                </div>
              )}
              
              <div className="p-8">
                {!selectedAnnouncement.imageUrl && (
                  <DialogHeader className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      {selectedAnnouncement.isUrgent && <Badge className="bg-red-500 text-white border-none">Urgent 🔴</Badge>}
                      <Badge className="bg-church-gold/10 text-church-gold border-none font-bold">
                        {churches.find(c => c.id === selectedAnnouncement.churchId)?.name || 'Annonce'}
                      </Badge>
                    </div>
                    <DialogTitle className="text-3xl font-serif font-bold text-slate-900 leading-tight">
                      {selectedAnnouncement.title}
                    </DialogTitle>
                  </DialogHeader>
                )}

                <div className="flex items-center gap-4 text-sm text-slate-400 mb-8 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Publié le {format(parseISO(selectedAnnouncement.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-church-gold font-medium">
                    <Megaphone className="w-4 h-4" />
                    <span className="capitalize">{selectedAnnouncement.category}</span>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                    {selectedAnnouncement.description}
                  </p>
                </div>

                {selectedAnnouncement.actionLink && (
                  <div className="mt-10">
                    <Button 
                      className="bg-church-gold hover:bg-amber-600 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-xl shadow-church-gold/30 w-full sm:w-auto"
                      onClick={() => {
                        setSelectedEventForRegistration({
                          ...selectedAnnouncement,
                          type: 'announcement',
                          displayTitle: selectedAnnouncement.title,
                          displayDate: selectedAnnouncement.createdAt,
                          displayLocation: "À confirmer",
                          fee: 0,
                          churchId: selectedAnnouncement.churchId
                        });
                        setSelectedAnnouncement(null);
                      }}
                    >
                      {selectedAnnouncement.actionLink.label}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Support Selection Dialog */}
      <Dialog 
        open={supportSelection.type !== 'donation' && !!supportSelection.type} 
        onOpenChange={(open) => !open && setSupportSelection({ churchId: null, type: null })}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-serif font-bold text-slate-900">
                {supportSelection.type === 'project' ? 'Soutenir un projet' : 'Payer une cotisation'}
              </DialogTitle>
              <DialogDescription className="text-church-gold font-bold uppercase tracking-wider text-xs">
                {supportSelection.churchId && churches.find(c => c.id === supportSelection.churchId)?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {supportSelection.type === 'project' ? (
                churchProjects
                  .filter(p => p.churchId === supportSelection.churchId)
                  .map(project => (
                    <Button 
                      key={project.id}
                      variant="outline"
                      className="w-full h-auto py-4 flex flex-col items-start gap-1 justify-center px-6 rounded-2xl hover:border-church-gold hover:text-church-gold text-slate-700 bg-slate-50 border-transparent transition-all"
                      onClick={() => {
                        handleContribute(`Projet: ${project.name}`, 'project', undefined, project.id);
                        setSupportSelection({ churchId: null, type: null });
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-base">{project.name}</span>
                        <ChevronRight className="w-4 h-4 opacity-30" />
                      </div>
                      <span className="text-xs text-slate-400">Objectif: {project.totalBudget.toLocaleString()} FCFA</span>
                    </Button>
                  ))
              ) : (
                contributionTypes
                  .filter(ct => ct.churchId === supportSelection.churchId)
                  .map(type => (
                    <Button 
                      key={type.id}
                      variant="outline"
                      className="w-full h-auto py-4 flex flex-col items-start gap-1 justify-center px-6 rounded-2xl hover:border-church-gold hover:text-church-gold text-slate-700 bg-slate-50 border-transparent transition-all"
                      onClick={() => {
                        handleContribute(type.name, 'contribution', type.amount, type.id);
                        setSupportSelection({ churchId: null, type: null });
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-base">{type.name}</span>
                        <ChevronRight className="w-4 h-4 opacity-30" />
                      </div>
                      <span className="text-xs text-slate-400">{type.amount.toLocaleString()} FCFA • {type.frequency === 'monthly' ? 'Mensuel' : 'Ponctuel'}</span>
                    </Button>
                  ))
              )}

              {(supportSelection.type === 'project' ? 
                churchProjects.filter(p => p.churchId === supportSelection.churchId).length === 0 : 
                contributionTypes.filter(ct => ct.churchId === supportSelection.churchId).length === 0) && (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 italic text-sm">Précisez votre demande auprès de l'église.</p>
                </div>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full mt-6 text-slate-400 hover:text-slate-600"
              onClick={() => setSupportSelection({ churchId: null, type: null })}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Church Selection Dialog */}
      <Dialog open={isChurchSelectorOpen} onOpenChange={setIsChurchSelectorOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-serif font-bold text-slate-900">Choisir une Église</DialogTitle>
              <DialogDescription>
                Recherchez et sélectionnez l'église que vous souhaitez soutenir.
              </DialogDescription>
            </DialogHeader>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher par nom ou ville..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-church-gold transition-colors text-sm"
                value={churchSearchTerm}
                onChange={(e) => setChurchSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {churches
                .filter(c => 
                  c.name.toLowerCase().includes(churchSearchTerm.toLowerCase()) || 
                  c.city.toLowerCase().includes(churchSearchTerm.toLowerCase())
                )
                .map((church) => (
                  <Button 
                    key={church.id}
                    variant="outline"
                    className="w-full h-auto py-4 flex flex-col items-start gap-1 justify-center px-6 rounded-2xl hover:border-church-gold hover:text-church-gold text-slate-700 bg-white border-slate-100 transition-all text-left"
                    onClick={() => {
                      setSupportSelection({ churchId: church.id, type: 'donation' });
                      handleContribute(`Don pour ${church.name}`, 'donation', undefined, church.id);
                      setIsChurchSelectorOpen(false);
                      setChurchSearchTerm('');
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-base">{church.name}</span>
                      <ChevronRight className="w-4 h-4 opacity-30" />
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {church.city}, {church.country}
                    </span>
                  </Button>
                ))
              }
              {churches.filter(c => 
                  c.name.toLowerCase().includes(churchSearchTerm.toLowerCase()) || 
                  c.city.toLowerCase().includes(churchSearchTerm.toLowerCase())
                ).length === 0 && (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 italic text-sm">Aucune église trouvée.</p>
                </div>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full mt-6 text-slate-400 hover:text-slate-600"
              onClick={() => {
                setIsChurchSelectorOpen(false);
                setChurchSearchTerm('');
              }}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Church Details Dialog (See All) */}
      <Dialog 
        open={!!selectedChurchDetailsId} 
        onOpenChange={(open) => !open && setSelectedChurchDetailsId(null)}
      >
        <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl bg-slate-50">
          {selectedChurchDetailsId && (
            <div className="flex flex-col">
              {/* Header */}
              {(() => {
                const church = churches.find(c => c.id === selectedChurchDetailsId);
                if (!church) return null;
                
                const churchEvents = events.filter(e => e.churchId === church.id && e.isPublished);
                const churchServices = services.filter(s => s.churchId === church.id && s.isPublished);
                const churchPrograms = churchProjects.filter(p => p.churchId === church.id);
                const churchCourses = courses.filter(c => c.churchId === church.id);
                const churchFunerals = funeralCases.filter(f => f.churchId === church.id && f.status === 'active');
                const churchContributions = contributionTypes.filter(ct => ct.churchId === church.id);
                const churchDepartments = departments.filter(d => d.churchId === church.id);

                return (
                  <>
                    <div className="relative h-64 w-full overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80" 
                        className="w-full h-full object-cover brightness-50 cursor-zoom-in hover:brightness-[0.6] transition-all"
                        alt={church.name}
                        onClick={() => setFullscreenImageUrl("https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80")}
                      />
                      <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-slate-900 to-transparent">
                        <h2 className="text-4xl font-serif font-bold text-white mb-2">{church.name}</h2>
                        <div className="flex items-center gap-4 text-white/70 text-sm">
                          <span className="flex items-center gap-1 font-medium italic"><MapPin className="w-4 h-4 text-church-gold" /> {church.city}, {church.country}</span>
                          <span className="flex items-center gap-1 font-medium"><Phone className="w-4 h-4 text-church-gold" /> {church.phone}</span>
                          <span className="flex items-center gap-1 font-medium"><Building2 className="w-4 h-4 text-church-gold" /> {church.pastor}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 space-y-12 pb-20">
                      {/* Description */}
                      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                        <p className="text-slate-600 leading-relaxed italic text-center text-lg">
                          "{church.description}"
                        </p>
                      </div>

                      {/* Sections Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* 1. Services / Cultes */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-2">
                            <Clock className="w-5 h-5 text-church-gold" /> Cultes & Communions
                          </h3>
                          <div className="space-y-3">
                            {churchServices.length > 0 ? churchServices.map(s => (
                              <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-start">
                                <div>
                                  <span className="text-[10px] font-bold text-church-gold uppercase tracking-widest block mb-1">
                                    {format(parseISO(s.date), 'EEEE dd MMMM', { locale: fr })}
                                  </span>
                                  <h4 className="font-bold text-slate-800">{s.theme || "Culte de Célébration"}</h4>
                                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {s.startTime} • {s.preacher}
                                  </p>
                                </div>
                                <Button 
                                  size="sm" 
                                  className="rounded-xl px-4 h-9 bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                                  onClick={() => {
                                    setSelectedEventForRegistration(s);
                                    setSelectedChurchDetailsId(null);
                                  }}
                                >
                                  Je participe
                                </Button>
                              </div>
                            )) : (
                              <p className="text-sm text-slate-400 italic px-2">Aucun culte programmé.</p>
                            )}
                          </div>
                        </div>

                        {/* 2. Events */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-2">
                            <Calendar className="w-5 h-5 text-church-gold" /> Événements Spéciaux
                          </h3>
                          <div className="space-y-3">
                            {churchEvents.length > 0 ? churchEvents.map(e => (
                              <div key={e.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-start">
                                <div>
                                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1">
                                    {format(parseISO(e.startDate), 'dd MMMM', { locale: fr })}
                                  </span>
                                  <h4 className="font-bold text-slate-800">{e.name}</h4>
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{e.description}</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  className="rounded-xl px-4 h-9 bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                                  onClick={() => {
                                    setSelectedEventForRegistration(e);
                                    setSelectedChurchDetailsId(null);
                                  }}
                                >
                                  Je participe
                                </Button>
                              </div>
                            )) : (
                              <p className="text-sm text-slate-400 italic px-2">Aucun événement à venir.</p>
                            )}
                          </div>
                        </div>

                        {/* 3. Projects / Programmes */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-2">
                            <Building2 className="w-5 h-5 text-church-gold" /> Programmes & Projets
                          </h3>
                          <div className="space-y-3">
                            {churchPrograms.length > 0 ? churchPrograms.map(p => (
                              <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <h4 className="font-bold text-slate-800">{p.name}</h4>
                                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-church-gold w-1/3" />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2">Cliquez pour soutenir ce projet</p>
                              </div>
                            )) : (
                              <p className="text-sm text-slate-400 italic px-2">Aucun projet en cours.</p>
                            )}
                          </div>
                        </div>

                        {/* 4. Formations */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-2">
                            <GraduationCap className="w-5 h-5 text-church-gold" /> Formations & Parcours
                          </h3>
                          <div className="space-y-3">
                            {churchCourses.length > 0 ? churchCourses.map(c => (
                              <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-start">
                                <div>
                                  <Badge className="mb-2 bg-violet-50 text-violet-600 border-none text-[10px]">{c.level}</Badge>
                                  <h4 className="font-bold text-slate-800">{c.title}</h4>
                                  <p className="text-xs text-slate-500 mt-1">{c.duration}</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  className="rounded-xl px-4 h-9 bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                                  onClick={() => {
                                    setSelectedEventForRegistration(c);
                                    setSelectedChurchDetailsId(null);
                                  }}
                                >
                                  Je participe
                                </Button>
                              </div>
                            )) : (
                              <p className="text-sm text-slate-400 italic px-2">Aucune formation disponible.</p>
                            )}
                          </div>
                        </div>

                        {/* 5. Funerals / Cas de décès */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-2">
                            <Heart className="w-5 h-5 text-church-gold" /> Vie de Communauté (Décès)
                          </h3>
                          <div className="space-y-3">
                            {churchFunerals.length > 0 ? churchFunerals.map(f => (
                              <div key={f.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                  <Heart className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800">{f.deceasedName}</h4>
                                  <p className="text-[10px] text-slate-400 italic">Nous sommes de tout coeur avec la famille.</p>
                                </div>
                              </div>
                            )) : (
                              <p className="text-sm text-slate-400 italic px-2">Aucun avis de décès en cours.</p>
                            )}
                          </div>
                        </div>

                        {/* 6. Cotisations */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-2">
                            <Coins className="w-5 h-5 text-church-gold" /> Cotisations & Soutiens
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            {churchContributions.length > 0 ? churchContributions.map(ct => (
                              <div key={ct.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                                <h4 className="font-bold text-slate-800 text-sm">{ct.name}</h4>
                                <p className="text-xs font-bold text-church-gold mt-1">{ct.amount.toLocaleString()} F</p>
                              </div>
                            )) : (
                              <p className="col-span-2 text-sm text-slate-400 italic px-2">Aucune cotisation définie.</p>
                            )}
                          </div>
                        </div>

                        {/* 7. Departements */}
                        <div className="md:col-span-2 space-y-4">
                          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-2">
                            <Building2 className="w-5 h-5 text-church-gold" /> Nos Départements & Ministères
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            {churchDepartments.length > 0 ? churchDepartments.map(d => (
                              <div key={d.id} className="bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm flex items-center gap-2 hover:border-church-gold hover:text-church-gold transition-all cursor-default">
                                <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-xs font-bold text-church-gold">
                                  {d.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium">{d.name}</span>
                              </div>
                            )) : (
                              <p className="text-sm text-slate-400 italic px-2">Aucun département répertorié.</p>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Call to Action */}
                      <div className="flex justify-center pt-8">
                        <Button 
                          size="lg" 
                          className="bg-church-gold hover:bg-amber-600 text-white rounded-2xl px-12 h-16 text-xl font-bold shadow-2xl shadow-church-gold/30"
                          onClick={() => {
                            setSupportSelection({ churchId: church.id, type: 'donation' });
                            handleContribute(`Don pour ${church.name}`, 'donation', undefined, church.id);
                            setSelectedChurchDetailsId(null);
                          }}
                        >
                          Soutenir cette Église <Heart className="w-6 h-6 ml-3 fill-current" />
                        </Button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Viewer */}
      <Dialog 
        open={!!fullscreenImageUrl} 
        onOpenChange={(open) => !open && setFullscreenImageUrl(null)}
      >
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center">
          <div className="relative group">
            {fullscreenImageUrl && (
              <img 
                src={fullscreenImageUrl} 
                alt="Affiche en taille réelle" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            )}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="secondary" 
                size="icon" 
                className="rounded-full bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40"
                onClick={() => setFullscreenImageUrl(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Event Registration Dialog */}
      <Dialog 
        open={!!selectedEventForRegistration} 
        onOpenChange={(open) => !open && setSelectedEventForRegistration(null)}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[32px] border-none shadow-2xl bg-white">
          <DialogHeader className="p-8 bg-slate-900 text-white shrink-0">
            <DialogTitle className="text-3xl font-serif font-bold">
              {(() => {
                const title = selectedEventForRegistration?.displayTitle || selectedEventForRegistration?.theme || selectedEventForRegistration?.name || selectedEventForRegistration?.title || "";
                const isCulte = title.toLowerCase().includes('culte') || selectedEventForRegistration?.theme;
                const isFormation = selectedEventForRegistration?.level || selectedEventForRegistration?.category === 'training' || title.toLowerCase().includes('formation') || title.toLowerCase().includes('cours');
                
                if (isCulte) return "Inscription au Culte";
                if (isFormation) return "Inscription à la Formation";
                return "Inscription à l'Événement";
              })()}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Veuillez remplir les informations ci-dessous pour confirmer votre participation à "{selectedEventForRegistration?.displayTitle || selectedEventForRegistration?.theme || selectedEventForRegistration?.name || selectedEventForRegistration?.title || "cet événement"}".
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {selectedEventForRegistration && (() => {
              const displayInfo = {
                title: (selectedEventForRegistration as any).displayTitle || (selectedEventForRegistration as any).theme || (selectedEventForRegistration as any).name || (selectedEventForRegistration as any).title || "Événement",
                date: (selectedEventForRegistration as any).displayDate || (selectedEventForRegistration as any).date || (selectedEventForRegistration as any).startDate || (selectedEventForRegistration as any).createdAt,
                time: (selectedEventForRegistration as any).time || (selectedEventForRegistration as any).startTime || "09:00",
                location: (selectedEventForRegistration as any).displayLocation || (selectedEventForRegistration as any).location || "Église Locale",
                fee: (selectedEventForRegistration as any).fee || 0,
                churchId: selectedEventForRegistration.churchId
              };

              return (
              <>
                {/* 1. Informations de l'événement */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-church-gold mb-2">
                    <Info className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-widest text-xs">
                      {selectedEventForRegistration?.theme ? "1. Informations du Culte" : 
                       selectedEventForRegistration?.level ? "1. Informations de la Formation" : 
                       "1. Informations de l'événement"}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div>
                      <Label className="text-[10px] uppercase text-slate-400 font-bold">
                        {selectedEventForRegistration?.theme ? "Thème du Culte" : 
                         selectedEventForRegistration?.level ? "Titre de la Formation" : 
                         "Désignation"}
                      </Label>
                      <p className="font-bold text-slate-900">{displayInfo.title}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase text-slate-400 font-bold">Organisateur</Label>
                      <p className="font-bold text-slate-900">{churches.find(c => c.id === displayInfo.churchId)?.name || 'Grace-Connect'}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase text-slate-400 font-bold">Date & Heure</Label>
                      <p className="font-bold text-slate-900">
                        {format(parseISO(displayInfo.date), 'dd MMMM yyyy', { locale: fr })} à {displayInfo.time}
                      </p>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase text-slate-400 font-bold">Lieu</Label>
                      <p className="font-bold text-slate-900">{displayInfo.location}</p>
                    </div>
                    {displayInfo.fee > 0 && (
                      <div className="md:col-span-2 pt-2 border-t border-slate-200 mt-2">
                        <Label className="text-[10px] uppercase text-slate-400 font-bold">Frais de participation</Label>
                        <p className="text-xl font-black text-red-600">{displayInfo.fee.toLocaleString()} FCFA</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* 2. Informations personnelles */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-church-gold mb-2">
                    <User className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-widest text-xs">2. Informations personnelles</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Nom *</Label>
                      <Input 
                        placeholder="Votre nom" 
                        value={registrationFormData.lastName}
                        onChange={(e) => setRegistrationFormData({...registrationFormData, lastName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prénom(s) *</Label>
                      <Input 
                        placeholder="Vos prénoms" 
                        value={registrationFormData.firstName}
                        onChange={(e) => setRegistrationFormData({...registrationFormData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sexe</Label>
                      <Select 
                        onValueChange={(val) => setRegistrationFormData({...registrationFormData, sex: val})}
                        value={registrationFormData.sex}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculin</SelectItem>
                          <SelectItem value="F">Féminin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Téléphone *</Label>
                      <Input 
                        placeholder="+225 ..." 
                        value={registrationFormData.phone}
                        onChange={(e) => setRegistrationFormData({...registrationFormData, phone: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Adresse</Label>
                      <Input 
                        placeholder="Ville, Quartier, ..." 
                        value={registrationFormData.address}
                        onChange={(e) => setRegistrationFormData({...registrationFormData, address: e.target.value})}
                      />
                    </div>
                  </div>
                </section>

                {/* 3. Informations ecclésiastiques */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-church-gold mb-2">
                    <Building2 className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-widest text-xs">3. Informations ecclésiastiques</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <Label className="flex-1">Êtes-vous membre d'une de nos églises ?</Label>
                      <div className="flex items-center gap-2">
                         <div className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              id="member-yes" 
                              name="isMember" 
                              checked={registrationFormData.isMember} 
                              onChange={() => setRegistrationFormData({...registrationFormData, isMember: true})}
                              className="w-4 h-4 accent-church-gold"
                            />
                            <Label htmlFor="member-yes">Oui</Label>
                         </div>
                         <div className="flex items-center gap-2 ml-4">
                            <input 
                              type="radio" 
                              id="member-no" 
                              name="isMember" 
                              checked={!registrationFormData.isMember} 
                              onChange={() => setRegistrationFormData({...registrationFormData, isMember: false})}
                              className="w-4 h-4 accent-church-gold"
                            />
                            <Label htmlFor="member-no">Non</Label>
                         </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {registrationFormData.isMember && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
                        >
                          <div className="space-y-2">
                            <Label>Église / Assemblée</Label>
                            <Input 
                              value={registrationFormData.churchName}
                              readOnly
                              className="bg-slate-50 border-slate-200 cursor-not-allowed"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Département / Statut</Label>
                            <Input 
                              placeholder="Ex: Chorale, Jeunesse, Membre..." 
                              value={registrationFormData.department}
                              onChange={(e) => setRegistrationFormData({...registrationFormData, department: e.target.value})}
                              readOnly={isDepartmentReadOnly}
                              className={isDepartmentReadOnly ? "bg-slate-50 border-slate-200 cursor-not-allowed" : ""}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </section>

                {/* 4. Type de participation */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-church-gold mb-2">
                    <Plus className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-widest text-xs">4. Type de participation</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: 'simple', label: 'Participant simple' },
                      { id: 'choriste', label: 'Choriste' },
                      { id: 'encadreur', label: 'Encadreur' },
                      { id: 'intervenant', label: 'Intervenant' },
                      { id: 'benevole', label: 'Bénévole' }
                    ].map(type => (
                      <div 
                        key={type.id}
                        onClick={() => setRegistrationFormData({...registrationFormData, participationType: type.id})}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-center font-bold text-xs flex items-center justify-center h-14 ${
                          registrationFormData.participationType === type.id 
                          ? 'border-church-gold bg-church-gold/5 text-church-gold' 
                          : 'border-slate-100 hover:border-slate-200 text-slate-500'
                        }`}
                      >
                        {type.label}
                      </div>
                    ))}
                  </div>
                </section>

                {/* 5. Paiement */}
                {(displayInfo.fee > 0 || (selectedEventForRegistration.merchandise || []).reduce((sum: number, item: any) => sum + (item.price * (merchQuantities[item.id] || 0)), 0) > 0) && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-church-gold mb-2">
                      <CreditCard className="w-5 h-5" />
                      <h3 className="font-bold uppercase tracking-widest text-xs">5. Paiement</h3>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-2xl text-white space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Montant total à régler :</span>
                        <span className="text-2xl font-black text-church-gold">{(displayInfo.fee + (selectedEventForRegistration.merchandise || []).reduce((sum: number, item: any) => sum + (item.price * (merchQuantities[item.id] || 0)), 0)).toLocaleString()} FCFA</span>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-white/60">Moyen de paiement :</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'orange_money', label: 'Orange Money' },
                            { id: 'mtn_money', label: 'MTN Money' },
                            { id: 'moov_money', label: 'Moov Money' },
                            { id: 'carte_bancaire', label: 'Carte bancaire' },
                            { id: 'sur_place', label: 'Paiement sur place' }
                          ].map(method => (
                            <div 
                              key={method.id}
                              onClick={() => setRegistrationFormData({...registrationFormData, paymentMethod: method.id})}
                              className={`p-3 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
                                registrationFormData.paymentMethod === method.id 
                                ? 'bg-white/10 border-church-gold text-church-gold' 
                                : 'bg-transparent border-white/10 text-white/80 hover:bg-white/5'
                              }`}
                            >
                              <div className={`w-3 h-3 rounded-full border ${registrationFormData.paymentMethod === method.id ? 'bg-church-gold border-church-gold' : 'border-white/40'}`} />
                              <span className="text-[10px] font-bold uppercase">{method.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* 6. Informations complémentaires */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-church-gold mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-widest text-xs">6. Informations complémentaires</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Besoins particuliers</Label>
                      <Input 
                        placeholder="Ex: Accessibilité, matériel..." 
                        value={registrationFormData.specialNeeds}
                        onChange={(e) => setRegistrationFormData({...registrationFormData, specialNeeds: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Allergies / santé</Label>
                      <Input 
                        placeholder="Informations médicales importantes" 
                        value={registrationFormData.healthIssues}
                        onChange={(e) => setRegistrationFormData({...registrationFormData, healthIssues: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Commentaire</Label>
                      <Textarea 
                        placeholder="Dites-nous en plus..." 
                        className="rounded-xl"
                        value={registrationFormData.comments}
                        onChange={(e) => setRegistrationFormData({...registrationFormData, comments: e.target.value})}
                      />
                    </div>
                  </div>
                </section>

                {/* 7. Articles en vente */}
                {selectedEventForRegistration.merchandise && selectedEventForRegistration.merchandise.length > 0 && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-church-gold mb-2">
                      <ShoppingBag className="w-5 h-5" />
                      <h3 className="font-bold uppercase tracking-widest text-xs">7. Articles en vente (Merchandising)</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedEventForRegistration.merchandise.map((item: any) => (
                        <div key={item.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3">
                          {item.imageUrls && item.imageUrls.length > 0 && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 relative">
                              <img src={item.imageUrls[0]} className="w-full h-full object-cover" alt={item.name} referrerPolicy="no-referrer" />
                              {item.imageUrls.length > 1 && (
                                <div className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[7px] px-0.5 rounded font-bold">
                                  +{item.imageUrls.length - 1}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-slate-900 text-xs">{item.name}</h4>
                              <Badge className="bg-church-gold text-white border-none text-[8px] h-4">{item.price.toLocaleString()} F</Badge>
                            </div>
                            <p className="text-[9px] text-slate-400 mb-2 line-clamp-1">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-slate-100">
                                <button 
                                  onClick={() => setMerchQuantities(prev => ({ ...prev, [item.id]: Math.max(0, (prev[item.id] || 0) - 1) }))}
                                  className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-500"
                                >
                                  <Minus className="w-2 h-2" />
                                </button>
                                <span className="font-bold text-[10px] w-3 text-center">{merchQuantities[item.id] || 0}</span>
                                <button 
                                  onClick={() => setMerchQuantities(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }))}
                                  className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-church-gold"
                                >
                                  <Plus className="w-2 h-2" />
                                </button>
                              </div>
                              {(merchQuantities[item.id] || 0) > 0 && (
                                  <span className="text-[10px] font-bold text-church-gold italic">
                                      {(item.price * (merchQuantities[item.id] || 0)).toLocaleString()} F
                                  </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 8. Validation */}
                <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                   <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="confirm" 
                      checked={registrationFormData.confirmAccuracy}
                      onCheckedChange={(val) => setRegistrationFormData({...registrationFormData, confirmAccuracy: !!val})}
                    />
                    <Label htmlFor="confirm" className="text-sm font-medium text-slate-700 leading-none cursor-pointer">
                      Je confirme l'exactitude des informations fournies ici.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="terms" 
                      checked={registrationFormData.acceptTerms}
                      onCheckedChange={(val) => setRegistrationFormData({...registrationFormData, acceptTerms: !!val})}
                    />
                    <Label htmlFor="terms" className="text-sm font-medium text-slate-700 leading-none cursor-pointer">
                      J'accepte les conditions de participation {
                        selectedEventForRegistration?.theme ? "à ce culte" : 
                        selectedEventForRegistration?.level ? "à cette formation" : 
                        "à cet événement"
                      }.
                    </Label>
                  </div>
                </section>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-2xl h-14 font-bold border-slate-200"
                    onClick={() => {
                        alert("Participation enregistrée avec succès !");
                        
                        // Merchandise orders
                        selectedEventForRegistration.merchandise?.forEach((item: any) => {
                          const qty = merchQuantities[item.id];
                          if (qty > 0) {
                            addEventOrder({
                              eventId: selectedEventForRegistration.id,
                              itemId: item.id,
                              customerName: `${registrationFormData.firstName} ${registrationFormData.lastName}`,
                              customerPhone: registrationFormData.phone,
                              quantity: qty,
                              totalAmount: item.price * qty,
                              status: 'pending'
                            });
                          }
                        });

                        setSelectedEventForRegistration(null);
                        setMerchQuantities({});
                    }}
                    disabled={!registrationFormData.confirmAccuracy || !registrationFormData.acceptTerms}
                  >
                    {selectedEventForRegistration?.theme ? "Participer au Culte" : 
                     selectedEventForRegistration?.level ? "Participer à la Formation" :
                     "Je participe"}
                  </Button>
                  {(displayInfo.fee > 0 || (selectedEventForRegistration.merchandise || []).some((i: any) => (merchQuantities[i.id] || 0) > 0)) && registrationFormData.paymentMethod !== 'sur_place' && (
                    <Button 
                      className="flex-1 rounded-2xl h-14 font-bold bg-church-gold hover:bg-amber-600 text-white shadow-xl shadow-church-gold/20"
                      onClick={() => {
                        const total = displayInfo.fee + (selectedEventForRegistration.merchandise || []).reduce((sum: number, item: any) => sum + (item.price * (merchQuantities[item.id] || 0)), 0);
                        handleContribute(`Participation/Commande: ${displayInfo.title}`, 'event', total, selectedEventForRegistration.id);
                        
                        // Merchandise orders
                        selectedEventForRegistration.merchandise?.forEach((item: any) => {
                          const qty = merchQuantities[item.id];
                          if (qty > 0) {
                            addEventOrder({
                              eventId: selectedEventForRegistration.id,
                              itemId: item.id,
                              customerName: `${registrationFormData.firstName} ${registrationFormData.lastName}`,
                              customerPhone: registrationFormData.phone,
                              quantity: qty,
                              totalAmount: item.price * qty,
                              status: 'pending' // Should probably be 'paid' if they pay online, but keeping 'pending' for church review
                            });
                          }
                        });

                        setSelectedEventForRegistration(null);
                        setMerchQuantities({});
                    }}
                    disabled={!registrationFormData.confirmAccuracy || !registrationFormData.acceptTerms}
                    >
                      {selectedEventForRegistration?.theme ? "Participer et payer le Culte" : 
                       selectedEventForRegistration?.level ? "Participer et payer la Formation" :
                       "Participer et payer"} <CheckCircle2 className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>
              </>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Training Registration Dialog */}
      <TrainingRegistrationDialog 
        isOpen={!!selectedTrainingForRegistration}
        onOpenChange={(open) => !open && setSelectedTrainingForRegistration(null)}
        training={selectedTrainingForRegistration}
      />

      {/* Announcement Detail Dialog */}
      <AnnouncementDetailDialog 
        isOpen={!!selectedAnnouncementDetail}
        onOpenChange={(open) => !open && setSelectedAnnouncementDetail(null)}
        announcement={selectedAnnouncementDetail}
        onParticipate={(ann) => {
          setSelectedAnnouncementDetail(null);
          setSelectedEventForRegistration({
            ...ann,
            type: 'announcement',
            displayTitle: ann.title,
            displayDate: ann.createdAt,
            displayLocation: "À confirmer",
            fee: 0,
            churchId: ann.churchId
          });
        }}
      />

      {/* Project Contribution Dialog */}
      <ProjectContributionDialog 
        isOpen={!!selectedProjectContribution}
        onOpenChange={(open) => !open && setSelectedProjectContribution(null)}
        project={selectedProjectContribution}
      />
    </div>
  );
}
