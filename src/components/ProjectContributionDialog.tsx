import React, { useState, useMemo, useRef } from 'react';
import { toJpeg } from 'html-to-image';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import { 
  Heart, 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  CreditCard, 
  CheckCircle2, 
  X,
  TrendingUp,
  Building2,
  Users,
  MessageCircle,
  Download,
  QrCode,
  Share2,
  History,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetAmount: number;
  currentAmount: number;
  churchName?: string;
  category?: string;
}

interface ProjectContributionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000];

const RECENT_CONTRIBUTORS = [
  { name: 'Jean K.', amount: 10000, time: 'Il y a 2h' },
  { name: 'Marie A.', amount: 5000, time: 'Il y a 5h' },
  { name: 'Pierre D.', amount: 25000, time: 'Hier' }
];

const maskAmount = (amount: number) => {
  const str = amount.toString();
  if (str.length <= 2) return str;
  return str.substring(0, 2) + '*'.repeat(str.length - 2);
};

export function ProjectContributionDialog({ isOpen, onOpenChange, project }: ProjectContributionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    status: 'membre',
    amount: '',
    paymentMethod: 'orange_money',
    contributionType: 'unique',
    message: '',
    confirmContribution: false,
    acceptTerms: false
  });

  const receiptRef = useRef<HTMLDivElement>(null);

  if (!project) return null;

  const handleDownloadReceipt = async () => {
    if (receiptRef.current === null) return;
    
    try {
      const dataUrl = await toJpeg(receiptRef.current, { quality: 0.95, backgroundColor: 'white' });
      const link = document.createElement('a');
      link.download = `recu-don-${registrationId}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating receipt:', err);
    }
  };

  const progressPercentage = Math.min(Math.round((project.currentAmount / project.targetAmount) * 100), 100);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate payment process
    await new Promise(resolve => setTimeout(resolve, 2500));
    setRegistrationId(`DON-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    setIsSubmitting(false);
    setSuccess(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-[32px] bg-white flex flex-col max-h-[95vh]">
        {!success ? (
          <>
            {/* Header with Background */}
            <div className="relative h-48 shrink-0">
              <img 
                src={project.imageUrl || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80"} 
                className="w-full h-full object-cover"
                alt={project.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              
              <button 
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-6 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all z-50"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-6 left-8 right-8 space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-emerald-500 text-white border-none py-0.5 px-2 rounded-lg flex items-center gap-1 text-[9px]">
                    <Building2 className="w-3 h-3" /> Projet de Construction
                  </Badge>
                </div>
                <h2 className="text-2xl font-serif font-black text-white leading-tight">{project.title}</h2>
                <div className="flex items-center gap-2 text-white/70 text-xs">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <span>Soutenu par <span className="text-white font-bold">{project.churchName || "Eglise Connect"}</span></span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Info & Motivation */}
                <div className="lg:col-span-4 space-y-10">
                  {/* Progress Section */}
                  <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400">État d'avancement</h3>
                      <span className="text-emerald-600 font-black text-xs">{progressPercentage}% atteint</span>
                    </div>
                    
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        className="h-full bg-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Collecté</span>
                        <span className="text-slate-900">{maskAmount(project.currentAmount)} FCFA</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Cible</span>
                        <span>{maskAmount(project.targetAmount)} FCFA</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400">Description du projet</h3>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      {project.description}
                    </p>
                  </div>

                  {/* Recent Contributors */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400">Derniers contributeurs</h3>
                      <Users className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="space-y-3">
                      {RECENT_CONTRIBUTORS.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-[10px]">
                              {c.name.charAt(0)}
                            </div>
                            <div>
                               <p className="text-xs font-bold text-slate-900">{c.name}</p>
                               <p className="text-[9px] text-slate-400">{c.time}</p>
                            </div>
                          </div>
                          <p className="text-xs font-black text-emerald-600">+{maskAmount(c.amount)} FCFA</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className={`text-slate-900 font-bold flex items-center gap-2 ${formData.status === 'anonyme' ? 'opacity-50' : ''}`}>
                         <User className="w-4 h-4 text-emerald-500" /> Nom complet *
                       </Label>
                       <Input 
                        placeholder={formData.status === 'anonyme' ? "Donateur Anonyme" : "Ex: Jean Koffi"} 
                        className="h-12 rounded-xl focus-visible:ring-emerald-500/20 border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                        value={formData.status === 'anonyme' ? "Anonyme" : formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        disabled={formData.status === 'anonyme'}
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-slate-900 font-bold flex items-center gap-2">
                         <Phone className="w-4 h-4 text-emerald-500" /> Téléphone *
                       </Label>
                       <Input 
                        placeholder="+225 ..." 
                        className="h-12 rounded-xl focus-visible:ring-emerald-500/20 border-slate-200"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                       />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest text-emerald-600">Statut</Label>
                    <RadioGroup 
                      className="grid grid-cols-2 md:grid-cols-4 gap-3"
                      value={formData.status}
                      onValueChange={(v) => setFormData({
                        ...formData, 
                        status: v,
                        fullName: v === 'anonyme' ? 'Anonyme' : (formData.fullName === 'Anonyme' ? '' : formData.fullName)
                      })}
                    >
                      {['membre', 'partenaire', 'visiteur', 'anonyme'].map((s) => (
                        <div key={s} className={`flex items-center space-x-2 p-3 rounded-xl border transition-all cursor-pointer ${
                          formData.status === s ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-slate-100 hover:bg-slate-50'
                        }`}>
                          <RadioGroupItem value={s} id={s} className="text-emerald-500 border-emerald-200" />
                          <Label htmlFor={s} className="flex-1 cursor-pointer font-bold text-[11px] capitalize">{s}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-slate-900 font-black uppercase text-[10px] tracking-widest text-emerald-600">Montant de la contribution</Label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 group-focus-within:text-emerald-500 transition-colors">FCFA</span>
                      <Input 
                        type="number"
                        placeholder="Entrez le montant" 
                        className="pl-16 h-14 rounded-2xl focus-visible:ring-emerald-500/20 border-slate-200 text-xl font-black"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {QUICK_AMOUNTS.map(amt => (
                         <Button 
                          key={amt}
                          variant="outline"
                          className={`rounded-xl h-10 px-4 font-bold transition-all ${formData.amount === amt.toString() ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-500'}`}
                          onClick={() => setFormData({...formData, amount: amt.toString()})}
                         >
                           {amt.toLocaleString()} FCFA
                         </Button>
                       ))}
                       <Button variant="ghost" className="rounded-xl h-10 px-4 font-bold text-slate-400">Autre</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <Label className="text-slate-900 font-bold flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-500" /> Moyen de paiement
                        </Label>
                        <RadioGroup 
                          className="grid grid-cols-1 gap-2"
                          value={formData.paymentMethod}
                          onValueChange={(v) => setFormData({...formData, paymentMethod: v})}
                        >
                          {[
                            { id: 'orange_money', label: 'Orange Money' },
                            { id: 'mtn_money', label: 'MTN Money' },
                            { id: 'moov_money', label: 'Moov Money' },
                            { id: 'card', label: 'Carte Bancaire' },
                            { id: 'promesse', label: 'Promesse de don' }
                          ].map((pay) => (
                            <div key={pay.id} className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              formData.paymentMethod === pay.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 hover:bg-slate-50'
                            }`}>
                              <RadioGroupItem value={pay.id} id={pay.id} className={`${formData.paymentMethod === pay.id ? 'bg-white border-white text-slate-900' : 'border-slate-200'}`} />
                              <Label htmlFor={pay.id} className="flex-1 cursor-pointer font-bold text-xs">{pay.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                     </div>

                     <div className="space-y-4">
                        <Label className="text-slate-900 font-bold flex items-center gap-2">
                          <Zap className="w-4 h-4 text-emerald-500" /> Type de contribution
                        </Label>
                        <RadioGroup 
                          className="grid grid-cols-1 gap-2"
                          value={formData.contributionType}
                          onValueChange={(v) => setFormData({...formData, contributionType: v})}
                        >
                          {[
                            { id: 'unique', label: 'Contribution unique' },
                            { id: 'mensuelle', label: 'Contribution mensuelle' },
                            { id: 'don_simple', label: 'Don simple' },
                            { id: 'materiel', label: 'Matériel / Équipement' }
                          ].map((type) => (
                            <div key={type.id} className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              formData.contributionType === type.id ? 'bg-sky-50 border-sky-200 text-sky-900' : 'bg-white border-slate-100 hover:bg-slate-50'
                            }`}>
                              <RadioGroupItem value={type.id} id={`type-${type.id}`} className="text-sky-600 border-sky-200" />
                              <Label htmlFor={`type-${type.id}`} className="flex-1 cursor-pointer font-bold text-xs">{type.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                     </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-900 font-bold flex items-center gap-2">
                       <MessageCircle className="w-4 h-4 text-emerald-500" /> Message (optionnel)
                    </Label>
                    <Textarea 
                      placeholder="Que Dieu bénisse ce projet..." 
                      className="min-h-[100px] rounded-2xl focus-visible:ring-emerald-500/20 border-slate-200 p-4 leading-relaxed bg-slate-50/30"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>

                  <div className="space-y-4 bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100/50">
                    <div className="flex items-start gap-4 cursor-pointer" onClick={() => setFormData({...formData, confirmContribution: !formData.confirmContribution})}>
                      <Checkbox 
                        id="confirm" 
                        checked={formData.confirmContribution}
                        onCheckedChange={(checked) => setFormData({...formData, confirmContribution: !!checked})}
                        className="mt-1 border-emerald-200 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <Label htmlFor="confirm" className="font-bold text-slate-700 cursor-pointer text-sm">Je confirme ma contribution</Label>
                    </div>
                    <div className="flex items-start gap-4 cursor-pointer" onClick={() => setFormData({...formData, acceptTerms: !formData.acceptTerms})}>
                      <Checkbox 
                        id="terms" 
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => setFormData({...formData, acceptTerms: !!checked})}
                        className="mt-1 border-emerald-200 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <Label htmlFor="terms" className="font-bold text-slate-700 cursor-pointer text-sm">J'accepte les conditions</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 shrink-0 gap-4 sm:justify-between items-center sm:flex-row flex-col">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] italic">
                <ShieldCheck className="w-3.5 h-3.5" /> Vos dons sont sécurisés et certifiés
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button 
                  variant="ghost" 
                  className="rounded-2xl h-12 px-6 font-bold text-slate-500 hover:text-slate-900 border border-slate-200 bg-white text-xs"
                  onClick={() => onOpenChange(false)}
                >
                  Fermer
                </Button>
                <Button 
                  variant="outline"
                  className="rounded-2xl h-12 px-6 font-bold text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs"
                  onClick={handleSubmit}
                  disabled={isSubmitting || (!formData.fullName && formData.status !== 'anonyme') || !formData.amount}
                >
                   Faire une promesse
                </Button>
                <Button 
                  className="rounded-2xl h-12 px-10 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-xl shadow-emerald-500/20 text-xs"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.confirmContribution || !formData.acceptTerms || (!formData.fullName && formData.status !== 'anonyme') || !formData.amount}
                >
                  {isSubmitting ? "Traitement..." : "Contribuer maintenant"}
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          /* Success State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col p-8 text-center items-center justify-center space-y-6 bg-white rounded-3xl overflow-y-auto custom-scrollbar"
          >
             <div className="relative">
                <div className="w-20 h-20 bg-emerald-100 rounded-[24px] flex items-center justify-center text-emerald-600 mb-2 relative z-10 animate-bounce shadow-xl border-4 border-white">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="absolute inset-0 bg-emerald-200 blur-2xl opacity-20 transform scale-125" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-black text-slate-900 tracking-tight">C'est merveilleux !</h2>
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Contribution enregistrée</p>
                <div className="bg-slate-50 border border-slate-100 py-2 px-6 rounded-2xl inline-block shadow-inner italic font-mono text-[10px] text-slate-500">
                  REF: {registrationId}
                </div>
                <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed font-medium">
                  Merci <span className="text-slate-900 font-black">{formData.fullName}</span> ! Votre contribution au projet <span className="text-emerald-600 font-bold">"{project.title}"</span> a été confirmée. Que Dieu vous bénisse abondamment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                 <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col items-center gap-3 group transition-all hover:scale-105">
                    <QrCode className="w-16 h-16 text-white opacity-80" />
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Référence de don</p>
                    <Button variant="ghost" className="text-white hover:bg-white/10 w-full h-10 rounded-xl font-bold text-xs gap-2">
                       Partager <Share2 className="w-3.5 h-3.5" />
                    </Button>
                 </div>

                 <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex flex-col items-center justify-center gap-3 transition-all hover:scale-105">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                       <Download className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                       <p className="font-black text-slate-900 text-sm">Reçu de don</p>
                       <p className="text-[9px] text-slate-400 italic">Prêt à être téléchargé</p>
                    </div>
                    <Button 
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-10 rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/20"
                      onClick={handleDownloadReceipt}
                    >
                       Télécharger reçu
                    </Button>
                 </div>
              </div>

              {/* Hidden Receipt Template for Download */}
              <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <div 
                  ref={receiptRef}
                  className="w-[400px] bg-white p-8 border-2 border-slate-100 rounded-lg flex flex-col items-center text-center space-y-6"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">REÇU DE DON</h1>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest">{project.churchName || "EKKLESIA AFRICA"}</p>
                  </div>

                  <div className="w-full h-px bg-slate-100 border-dashed border-t" />

                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="text-left">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Donateur</p>
                        <p className="text-sm font-bold text-slate-900">{formData.fullName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Date</p>
                        <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>

                    <div className="text-left">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Projet</p>
                      <p className="text-xs font-bold text-slate-700">{project.title}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Montant versé</p>
                      <p className="text-2xl font-black text-emerald-600">{Number(formData.amount).toLocaleString()} FCFA</p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-100 border-dashed border-t" />

                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-medium italic">"Que Dieu bénisse votre générosité"</p>
                    <p className="text-[8px] font-mono text-slate-300">REF: {registrationId}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span className="text-[8px] font-black text-slate-400 uppercase">Certifié par Connect Church</span>
                  </div>
                </div>
              </div>

              <Button 
                variant="ghost" 
                className="mt-8 text-slate-400 hover:text-slate-900 font-bold"
                onClick={() => onOpenChange(false)}
              >
                Retour à l'accueil
              </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
