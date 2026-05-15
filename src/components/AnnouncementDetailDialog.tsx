import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  Download, 
  Eye, 
  Share2, 
  CalendarPlus, 
  UserCircle, 
  X,
  FileText,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  Bell,
  AlertCircle,
  ShoppingBag,
  Tag,
  Plus,
  Minus,
  Package,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Announcement, useStore } from '../lib/store';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface AnnouncementDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
  onParticipate?: (announcement: Announcement) => void;
}

export function AnnouncementDetailDialog({ isOpen, onOpenChange, announcement, onParticipate }: AnnouncementDetailDialogProps) {
  const { addEventOrder } = useStore();
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [isOrdering, setIsOrdering] = React.useState(false);

  if (!announcement) return null;

  const getStatusBadge = () => {
    if (announcement.isUrgent) return { label: 'Urgent', color: 'bg-red-500', icon: AlertCircle };
    if (announcement.category === 'event') return { label: 'Événement', color: 'bg-blue-500', icon: Calendar };
    return { label: 'Nouveau', color: 'bg-green-500', icon: Bell };
  };

  const status = getStatusBadge();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-[32px] bg-white flex flex-col max-h-[92vh]">
        {/* Banner */}
        <div className="relative h-64 shrink-0">
          <img 
            src={announcement.imageUrl || "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=1200&q=80"} 
            className="w-full h-full object-cover"
            alt={announcement.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          
          <div className="absolute top-6 left-8 flex items-center gap-2">
            <Badge className={`${status.color} text-white border-none px-3 py-1 rounded-lg shadow-lg flex items-center gap-1.5`}>
              <status.icon className="w-3.5 h-3.5" />
              {status.label}
            </Badge>
          </div>

          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-6 right-8 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all z-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-8 left-8 right-8">
            <h2 className="text-xl font-serif font-black text-white leading-tight drop-shadow-lg">{announcement.title}</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">
              {/* Informations Principales */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-church-gold shadow-sm shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</p>
                    <p className="font-bold text-slate-900">{format(parseISO(announcement.createdAt), 'dd MMMM yyyy', { locale: fr })}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-church-gold shadow-sm shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Heure</p>
                    <p className="font-bold text-slate-900">18:30 GMT</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-church-gold shadow-sm shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Lieu</p>
                    <p className="font-bold text-slate-900">Temple Central / En ligne</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-church-gold shadow-sm shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Organisateur</p>
                    <p className="font-bold text-slate-900">Grace-Connect</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-church-gold" /> Description complète
                </h3>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed italic">
                  {announcement.description}
                  <p className="mt-4">
                    Nous invitons tous les fidèles à participer activement à ce moment fort de notre communauté. 
                    Que la grâce de Dieu soit avec vous tous.
                  </p>
                </div>
              </div>

              {/* Merchandising Section */}
              {announcement.merchandise && announcement.merchandise.length > 0 && (
                <div className="space-y-6 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-church-gold" /> Articles en vente
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {announcement.merchandise.map(item => (
                      <div key={item.id} className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-4">
                            {item.imageUrls && item.imageUrls.length > 0 ? (
                              <div className="space-y-2">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative group">
                                  <img src={item.imageUrls[0]} className="w-full h-full object-cover" alt={item.name} referrerPolicy="no-referrer" />
                                  {item.imageUrls.length > 1 && (
                                    <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur-sm text-[8px] text-white text-center font-black py-0.5">
                                      {item.imageUrls.length} PHOTOS
                                    </div>
                                  )}
                                </div>
                                {item.imageUrls.length > 1 && (
                                  <div className="flex gap-1 overflow-x-auto pb-1 max-w-[80px]">
                                    {item.imageUrls.slice(1, 4).map((url, idx) => (
                                      <div key={idx} className="w-4 h-4 rounded-md overflow-hidden flex-shrink-0 border border-slate-100">
                                        <img src={url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-3 bg-church-gold/10 rounded-2xl h-fit">
                                 <Package className="w-5 h-5 text-church-gold" />
                              </div>
                            )}
                            <div>
                              <h4 className="text-lg font-bold text-slate-900 mb-1">{item.name}</h4>
                              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Prix Unitaire</p>
                            </div>
                          </div>
                          <Badge className="bg-slate-900 text-white border-none font-black px-3 py-1">
                            {item.price.toLocaleString()} CFA
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{item.description}</p>
                        
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setQuantities(prev => ({ ...prev, [item.id]: Math.max(0, (prev[item.id] || 0) - 1) }))}
                              className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:shadow-md transition-all"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold w-4 text-center text-slate-700">{quantities[item.id] || 0}</span>
                            <button 
                              onClick={() => setQuantities(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }))}
                              className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-church-gold hover:shadow-md transition-all"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <Button 
                            size="sm" 
                            disabled={(quantities[item.id] || 0) === 0}
                            className="rounded-xl bg-church-gold text-white font-bold h-8 shadow-lg shadow-church-gold/20 disabled:shadow-none disabled:bg-slate-200"
                            onClick={() => setIsOrdering(true)}
                          >
                             Commander
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Form Modal Overlay (Simplified as part of the dialog content for better UX) */}
              <AnimatePresence>
                {isOrdering && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed inset-x-0 bottom-0 z-[60] p-4 md:p-8"
                  >
                    <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-2xl max-w-2xl mx-auto border border-white/10">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <Tag className="w-5 h-5 text-church-gold" /> Finaliser votre commande
                        </h3>
                        <button onClick={() => setIsOrdering(false)} className="text-white/40 hover:text-white">
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-white/40 tracking-widest pl-1">Nom Complet</label>
                            <input 
                              type="text" 
                              placeholder="Votre nom" 
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-church-gold/50 transition-colors"
                              value={customerName}
                              onChange={e => setCustomerName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-white/40 tracking-widest pl-1">Téléphone</label>
                            <input 
                              type="tel" 
                              placeholder="Votre numéro" 
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-church-gold/50 transition-colors"
                              value={customerPhone}
                              onChange={e => setCustomerPhone(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                          {announcement.merchandise?.filter(item => quantities[item.id] > 0).map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                              <span className="text-white/70">{item.name} (x{quantities[item.id]})</span>
                              <span className="font-bold text-church-gold">{(item.price * (quantities[item.id] || 0)).toLocaleString()} CFA</span>
                            </div>
                          ))}
                          <div className="pt-3 border-t border-white/10 flex justify-between items-center font-bold">
                            <span>Total</span>
                            <span className="text-xl text-church-gold">
                              {announcement.merchandise?.reduce((sum, item) => sum + (item.price * (quantities[item.id] || 0)), 0).toLocaleString()} CFA
                            </span>
                          </div>
                        </div>

                        <Button 
                          className="w-full bg-church-gold hover:bg-amber-600 text-white rounded-2xl h-14 font-black shadow-xl shadow-church-gold/20 text-lg transition-all active:scale-95"
                          disabled={!customerName || !customerPhone}
                          onClick={() => {
                            announcement.merchandise?.forEach(item => {
                              const qty = quantities[item.id];
                              if (qty > 0) {
                                addEventOrder({
                                  eventId: announcement.id, // Using announcement id for simplicity if event id isn't direct
                                  itemId: item.id,
                                  customerName,
                                  customerPhone,
                                  quantity: qty,
                                  totalAmount: item.price * qty,
                                  status: 'pending'
                                });
                              }
                            });
                            toast.success("Votre commande a été transmise !");
                            setIsOrdering(false);
                            setQuantities({});
                            setCustomerName('');
                            setCustomerPhone('');
                          }}
                        >
                          Confirmer la commande <Check className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pièces Jointes */}
              <div className="space-y-4">
                <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                   Pièces jointes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'Affiche de l\'annonce', type: 'image', icon: ImageIcon },
                    { name: 'Programme complet PDF', type: 'pdf', icon: FileText },
                    { name: 'Vidéo de présentation', type: 'video', icon: Video }
                  ].map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-church-gold transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-church-gold">
                          <file.icon className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-bold text-slate-700">{file.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-church-gold">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-church-gold">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="lg:col-span-4 space-y-8">
              {/* Public Concerné */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <UserCircle className="w-4 h-4" /> Public concerné
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Tous les membres', 'Jeunesse', 'Chorale', 'Responsables'].map((p, i) => (
                    <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-slate-900 rounded-[28px] p-6 text-white space-y-6 shadow-xl shadow-slate-900/20">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest opacity-50">Actions rapides</p>
                  <div className="h-px bg-white/10" />
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 uppercase text-[10px] tracking-wider shadow-lg shadow-red-600/20 border-none"
                    onClick={() => onParticipate?.(announcement)}
                  >
                    {announcement.actionLink?.label || "Sélectionner"} <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2">
                    Ajouter au calendrier <CalendarPlus className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2">
                    Partager <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 shrink-0 flex items-center justify-between gap-4">
          <Button 
            variant="ghost" 
            className="rounded-2xl h-12 px-6 font-bold text-slate-500 hover:text-slate-900"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
          <Button 
            className="rounded-2xl h-12 px-10 bg-red-600 hover:bg-red-700 text-white font-bold shadow-xl shadow-red-600/20 uppercase text-xs tracking-wider border-none"
            onClick={() => onParticipate?.(announcement)}
          >
            {announcement.actionLink?.label || "Sélectionner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
