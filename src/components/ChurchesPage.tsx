import React, { useState } from 'react';
import { useStore, Church } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Building2, 
  ArrowLeft,
  Eye,
  Users,
  Baby,
  UserCircle,
  LayoutGrid,
  GraduationCap,
  Briefcase,
  Heart,
  TrendingUp,
  User,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from './ui/dialog';
import { PaymentDialog } from './PaymentDialog';
import { motion, AnimatePresence } from 'motion/react';

export function ChurchesPage() {
  const { churches } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentData, setPaymentData] = useState<{
    title: string;
    type: 'donation' | 'contribution' | 'event' | 'project';
    amount?: number;
    targetId?: string;
  }>({
    title: '',
    type: 'donation'
  });
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedChurchDetails, setSelectedChurchDetails] = useState<Church | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectionChurch, setSelectionChurch] = useState<Church | null>(null);
  const [selectionType, setSelectionType] = useState<'contribution' | 'project' | 'training' | null>(null);
  const [selectionOpen, setSelectionOpen] = useState(false);

  const handleContribute = (title: string, type: 'donation' | 'contribution' | 'event' | 'project', amount?: number, targetId?: string) => {
    setPaymentData({ title, type, amount, targetId });
    setPaymentOpen(true);
  };

  const filteredChurches = churches.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white p-8 md:p-12">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            className="text-white/60 hover:text-white mb-8 -ml-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Retour à l'accueil
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Nos Églises Répertoriées</h1>
              <p className="text-white/60 text-lg max-w-2xl">
                Découvrez l'ensemble de nos communautés et choisissez celle que vous souhaitez soutenir ou rejoindre.
              </p>
            </div>
            <div className="hidden md:block">
              <Building2 className="w-24 h-24 text-church-gold/20" />
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
            <Input 
              placeholder="Filtrer par nom, ville ou pays..." 
              className="pl-14 py-8 rounded-2xl border-slate-200 focus:border-church-gold ring-church-gold text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChurches.map((church, index) => (
            <motion.div
              key={church.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-none shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col p-0 rounded-[24px] bg-white border border-slate-100 group h-full">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-[16px] flex items-center justify-center text-slate-400 group-hover:bg-church-gold/10 group-hover:text-church-gold transition-all overflow-hidden border border-slate-100 shrink-0">
                        {church.logoUrl ? (
                          <img 
                            src={church.logoUrl} 
                            alt={`Logo ${church.name}`} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Building2 className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-0.5 line-clamp-1">{church.name}</h4>
                        <p className="text-slate-500 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-church-gold"/> {church.city}
                        </p>
                      </div>
                    </div>
                    <Badge className={`
                      ${church.type === 'central' 
                        ? 'bg-church-gold text-white' 
                        : 'bg-blue-50 text-blue-600'
                      } border-none font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0
                    `}>
                      {church.type === 'central' ? 'Centrale' : 'Branche'}
                    </Badge>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                    {church.description || "Une communauté vivante dédiée au partage de l'Évangile et au soutien mutuel."}
                  </p>

                  <div className="mb-4">
                    <Button 
                      size="sm"
                      className="w-full bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold py-5 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-200"
                      onClick={() => {
                        setSelectedChurchDetails(church);
                        setDetailsOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 text-church-gold" /> Voir détails
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-church-gold hover:text-white hover:bg-church-gold font-bold text-[10px] uppercase py-4 rounded-xl border-church-gold/20 hover:border-church-gold transition-all"
                      onClick={() => handleContribute(`Don pour ${church.name}`, 'donation', undefined, church.id)}
                    >
                      Don
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold text-[10px] uppercase py-4 rounded-xl border-slate-200 transition-all"
                      onClick={() => {
                        setSelectionChurch(church);
                        setSelectionType('contribution');
                        setSelectionOpen(true);
                      }}
                    >
                      Cotisations
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold text-[10px] uppercase py-4 rounded-xl border-slate-200 transition-all"
                      onClick={() => {
                        setSelectionChurch(church);
                        setSelectionType('project');
                        setSelectionOpen(true);
                      }}
                    >
                      Projets
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-white hover:bg-blue-600 font-bold text-[10px] uppercase py-4 rounded-xl border-blue-100 transition-all"
                      onClick={() => {
                        setSelectionChurch(church);
                        setSelectionType('training');
                        setSelectionOpen(true);
                      }}
                    >
                      Formations
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {filteredChurches.length === 0 && (
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Search className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Aucun résultat</h3>
            <p className="text-slate-500">Désolé, nous n'avons trouvé aucune église correspondant à "{searchTerm}".</p>
            <Button 
              variant="link" 
              className="mt-4 text-church-gold font-bold"
              onClick={() => setSearchTerm('')}
            >
              Effacer la recherche
            </Button>
          </div>
        )}
      </main>

      {/* Payment Dialog */}
      <PaymentDialog 
        isOpen={paymentOpen} 
        onClose={() => setPaymentOpen(false)} 
        title={paymentData.title}
        type={paymentData.type}
        amount={paymentData.amount}
        targetId={paymentData.targetId}
      />

      {/* Church Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[40px] border-none shadow-2xl bg-white">
          {selectedChurchDetails && (
            <>
              <DialogHeader className="p-6 bg-slate-900 text-white shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-church-gold/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                
                {/* Watermark Logo */}
                {selectedChurchDetails.logoUrl && (
                  <div className="absolute -right-4 -bottom-4 w-40 h-40 opacity-10 pointer-events-none rotate-12">
                    <img 
                      src={selectedChurchDetails.logoUrl} 
                      className="w-full h-full object-contain grayscale invert brightness-200" 
                      alt="" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/20 p-1.5 overflow-hidden shadow-2xl shrink-0">
                    {selectedChurchDetails.logoUrl ? (
                      <img 
                        src={selectedChurchDetails.logoUrl} 
                        className="w-full h-full object-cover rounded-xl" 
                        alt="" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-church-gold" />
                    )}
                  </div>
                  <div>
                    <Badge className="bg-church-gold text-white border-none mb-1 px-3 py-0.5 text-[10px]">
                      {selectedChurchDetails.type === 'central' ? 'Église Centrale' : 'Branche Locale'}
                    </Badge>
                    <DialogTitle className="text-2xl font-serif font-bold leading-tight">
                      {selectedChurchDetails.name}
                    </DialogTitle>
                    <DialogDescription className="text-white/60 text-sm flex items-center gap-1.5 mt-1">
                       <MapPin className="w-3.5 h-3.5" /> {selectedChurchDetails.city}, {selectedChurchDetails.country}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                {/* Stats Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-church-gold" /> Statistiques des Membres
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4 border-none bg-slate-50 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-0.5">Adultes</p>
                        <div className="flex items-end gap-4">
                          <div>
                            <span className="text-xl font-black text-slate-900">{selectedChurchDetails.stats?.adults.m || 0}</span>
                            <span className="text-slate-400 text-[9px] font-bold ml-1 uppercase">Hommes</span>
                          </div>
                          <div>
                            <span className="text-xl font-black text-slate-900">{selectedChurchDetails.stats?.adults.f || 0}</span>
                            <span className="text-slate-400 text-[9px] font-bold ml-1 uppercase">Femmes</span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 border-none bg-slate-50 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                        <Baby className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-0.5">Enfants (ECODIM)</p>
                        <div className="flex items-end gap-4">
                          <div>
                            <span className="text-xl font-black text-slate-900">{selectedChurchDetails.stats?.children.m || 0}</span>
                            <span className="text-slate-400 text-[9px] font-bold ml-1 uppercase">Garçons</span>
                          </div>
                          <div>
                            <span className="text-xl font-black text-slate-900">{selectedChurchDetails.stats?.children.f || 0}</span>
                            <span className="text-slate-400 text-[9px] font-bold ml-1 uppercase">Filles</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Officials Section */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-church-gold" /> Corps Pastoral & Responsables
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedChurchDetails.officials ? (
                      selectedChurchDetails.officials.map((off) => (
                        <motion.div 
                          key={off.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                        >
                          <div className="w-14 h-14 rounded-xl overflow-hidden relative shadow-md ring-2 ring-slate-100 group-hover:ring-church-gold/20 transition-all shrink-0">
                            <img src={off.photoUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                            <div className={`absolute bottom-0 left-0 right-0 h-1 ${off.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                          </div>
                          <div>
                            <p className="text-church-gold font-bold text-[9px] uppercase tracking-widest mb-0.5 leading-none">
                              {off.department ? `${off.role} • ${off.department}` : off.role}
                            </p>
                            <h4 className="text-base font-bold text-slate-900 leading-tight mb-1">{off.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[8px] font-bold border-slate-200 h-4 px-1.5">
                                {off.gender === 'M' ? 'Homme' : 'Femme'}
                              </Badge>
                              {off.role.toLowerCase().includes('pasteur') && (
                                <Badge className="bg-slate-900 text-white text-[8px] font-bold h-4 px-1.5">Ordre Pastoral</Badge>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                         <p className="text-slate-400 text-sm italic">Aucune information détaillée disponible.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-5 bg-slate-50 border-t border-slate-100 shrink-0 flex justify-end">
                <Button 
                  className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold h-10"
                  onClick={() => setDetailsOpen(false)}
                >
                  Fermer
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Selection Dialog */}
      <Dialog open={selectionOpen} onOpenChange={setSelectionOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-[32px] border-none shadow-2xl bg-slate-50">
          {selectionChurch && selectionType && (
            <>
              <DialogHeader className="p-8 bg-slate-900 text-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center p-1 border border-white/10">
                    {selectionType === 'contribution' && <Users className="w-6 h-6 text-church-gold" />}
                    {selectionType === 'project' && <Briefcase className="w-6 h-6 text-church-gold" />}
                    {selectionType === 'training' && <GraduationCap className="w-6 h-6 text-church-gold" />}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-serif font-bold">
                      {selectionType === 'contribution' && 'Nos Cotisations'}
                      {selectionType === 'project' && 'Nos Projets'}
                      {selectionType === 'training' && 'Nos Formations'}
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                      {selectionChurch.name}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectionType === 'contribution' && (
                  selectionChurch.publishedContributions?.length ? (
                    selectionChurch.publishedContributions.map(cont => (
                      <Card key={cont.id} className="p-5 border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white overflow-hidden group">
                        <div className="flex flex-col md:flex-row gap-6">
                          {cont.type === 'funeral' && cont.deceasedDetails && (
                            <div className="md:w-32 h-32 rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-100 relative">
                              <img src={cont.deceasedDetails.photoUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white rounded-full font-bold text-[8px]">FEU</div>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h4 className="font-bold text-slate-900 text-lg group-hover:text-church-gold transition-colors">{cont.title}</h4>
                              {cont.amount && <Badge className="bg-slate-100 text-slate-600 border-none shrink-0">{cont.amount.toLocaleString()} FCFA</Badge>}
                            </div>
                            <p className="text-slate-500 text-sm mb-4 leading-relaxed">{cont.description}</p>
                            
                            {cont.type === 'funeral' && cont.deceasedDetails && (
                              <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-100">
                                    <User className="w-5 h-5 text-slate-400" />
                                  </div>
                                  <div className="text-xs">
                                    <p className="text-slate-400 font-bold uppercase mb-0.5 tracking-wider">Famille concernée</p>
                                    <p className="text-slate-700 font-bold">{cont.deceasedDetails.familyMemberName} ({cont.deceasedDetails.relationship})</p>
                                    <p className="text-slate-400 italic">Défunt: {cont.deceasedDetails.name}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <Button 
                              className="w-full bg-church-gold hover:bg-church-gold/90 text-white font-bold rounded-xl py-6"
                              onClick={() => {
                                handleContribute(cont.title, 'contribution', cont.amount, selectionChurch.id);
                                setSelectionOpen(false);
                              }}
                            >
                              Contribuer maintenant
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                      <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400">Aucune cotisation publiée pour le moment.</p>
                    </div>
                  )
                )}

                {selectionType === 'project' && (
                  selectionChurch.publishedProjects?.length ? (
                    selectionChurch.publishedProjects.map(proj => (
                      <Card key={proj.id} className="p-0 border-none shadow-sm hover:shadow-md transition-all rounded-3xl bg-white overflow-hidden">
                        <div className="h-40 relative">
                          <img src={proj.imageUrl || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80'} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h4 className="text-white font-bold text-xl mb-1">{proj.title}</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-church-gold" 
                                  style={{ width: `${Math.min((proj.currentAmount / proj.targetAmount) * 100, 100)}%` }} 
                                />
                              </div>
                              <span className="text-white text-[10px] font-bold shrink-0">{Math.round((proj.currentAmount / proj.targetAmount) * 100)}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-3">{proj.description}</p>
                          <div className="flex items-center justify-between mb-6 bg-slate-50 p-4 rounded-2xl">
                            <div>
                              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Objectif</p>
                              <p className="text-slate-900 font-bold">{proj.targetAmount.toLocaleString()} FCFA</p>
                            </div>
                            <div className="text-right">
                              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Récolté</p>
                              <p className="text-church-gold font-bold">{proj.currentAmount.toLocaleString()} FCFA</p>
                            </div>
                          </div>
                          <Button 
                            className="w-full bg-slate-900 hover:bg-black text-white font-bold rounded-xl py-6 flex items-center justify-center gap-2"
                            onClick={() => {
                              handleContribute(proj.title, 'project', undefined, selectionChurch.id);
                              setSelectionOpen(false);
                            }}
                          >
                            Participer au projet <TrendingUp className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                      <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400">Aucun projet publié pour le moment.</p>
                    </div>
                  )
                )}

                {selectionType === 'training' && (
                  selectionChurch.publishedTrainings?.length ? (
                    selectionChurch.publishedTrainings.map(train => (
                      <Card key={train.id} className="p-0 border-none shadow-sm hover:shadow-md transition-all rounded-3xl bg-white overflow-hidden group">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-48 h-48 md:h-auto overflow-hidden shrink-0">
                            <img src={train.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                          </div>
                          <div className="p-6 flex flex-col justify-between flex-1">
                            <div>
                              <h4 className="font-bold text-slate-900 text-xl mb-2">{train.title}</h4>
                              <p className="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2">{train.description}</p>
                              <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Calendar className="w-4 h-4 text-church-gold" />
                                  <span className="text-xs font-bold">{new Date(train.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                  <User className="w-4 h-4 text-church-gold" />
                                  <span className="text-xs font-bold">{train.instructor}</span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              className="w-full bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-900 font-bold rounded-xl py-6 flex items-center justify-center gap-2 transition-all"
                              onClick={() => {
                                setSelectionOpen(false);
                                alert(`Demande d'inscription envoyée pour la formation: ${train.title}. Vous serez recontacté(e) par l'église.`);
                              }}
                            >
                              S'inscrire à la formation <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                      <GraduationCap className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400">Aucune formation publiée pour le moment.</p>
                    </div>
                  )
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0 flex justify-end">
                <Button 
                  variant="ghost"
                  className="font-bold text-slate-500 hover:text-slate-900"
                  onClick={() => setSelectionOpen(false)}
                >
                  Annuler
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
