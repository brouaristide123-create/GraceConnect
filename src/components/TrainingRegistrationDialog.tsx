import React, { useState } from 'react';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import { 
  GraduationCap, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Upload,
  Info,
  QrCode,
  CreditCard,
  MessageSquare,
  Trophy,
  History,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TrainingRegistrationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  training: {
    id: string;
    title: string;
    instructor: string;
    startDate: string;
    endDate?: string;
    duration?: string;
    level?: string;
    cost?: number;
    imageUrl?: string;
    churchName?: string;
    capacity?: number;
    registeredCount?: number;
  } | null;
}

export function TrainingRegistrationDialog({ isOpen, onOpenChange, training }: TrainingRegistrationProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
    address: '',
    churchStatus: 'membre_actif',
    currentLevel: 'debutant',
    motivation: '',
    hasPreviousExperience: 'non',
    previousExperienceDetails: '',
    paymentMode: 'gratuit',
    selectedPaymentMethod: '',
    availability: [] as string[],
    commitment: false,
    files: {
      photo: null as File | null,
      receipt: null as File | null,
      certificate: null as File | null
    }
  });

  if (!training) return null;

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRegistrationId(`REG-TRAIN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    setIsSubmitting(false);
    setStep(4); // Success step
  };

  const steps = [
    { title: 'Informations Personnelles', icon: User },
    { title: 'Détails & Motivation', icon: GraduationCap },
    { title: 'Paiement & Validation', icon: CreditCard }
  ];

  const placesRemaining = training.capacity ? training.capacity - (training.registeredCount || 0) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] p-0 overflow-hidden border-none shadow-2xl rounded-[32px] bg-white flex flex-col">
        {step < 4 ? (
          <>
            {/* Header with Background */}
            <div className="relative h-48 shrink-0">
              <img 
                src={training.imageUrl || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80"} 
                className="w-full h-full object-cover"
                alt=""
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              
              <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-600 text-white border-none rounded-lg py-1 px-3">Formation</Badge>
                    {training.capacity && (
                      <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-md">
                        {placesRemaining} places restantes
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-white leading-tight">{training.title}</h2>
                  <div className="flex items-center gap-4 text-white/70 text-sm">
                    <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-blue-400" /> {training.instructor}</span>
                    <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-blue-400" /> {training.churchName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-100 w-full shrink-0">
              <motion.div 
                className="h-full bg-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Stepper Navigation */}
            <div className="bg-slate-50 border-b border-slate-100 flex items-center justify-center gap-8 py-4 shrink-0 overflow-x-auto px-4">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-3 shrink-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    step === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 
                    step > i + 1 ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${step === i + 1 ? 'text-blue-600' : 'text-slate-400'}`}>Étape {i + 1}</p>
                    <p className={`text-xs font-bold leading-none ${step === i + 1 ? 'text-slate-900' : 'text-slate-500'}`}>{s.title}</p>
                  </div>
                  {i < steps.length - 1 && <div className="hidden sm:block w-8 h-px bg-slate-200 mx-2" />}
                </div>
              ))}
            </div>

            {/* Registration Form Content */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    {/* Training Auto Info Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-blue-600 font-bold opacity-60">Durée</Label>
                        <p className="font-bold text-slate-900">{training.duration || "6 semaines"}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-blue-600 font-bold opacity-60">Période</Label>
                        <p className="font-bold text-slate-900">
                          {format(parseISO(training.startDate), 'dd MMM', { locale: fr })} - {training.endDate ? format(parseISO(training.endDate), 'dd MMM yyyy', { locale: fr }) : "À définir"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-blue-600 font-bold opacity-60">Niveau requis</Label>
                        <p className="font-bold text-slate-900">{training.level || "Tous niveaux"}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-blue-600 font-bold opacity-60">Coût</Label>
                        <p className="font-black text-rose-600">{training.cost ? `${training.cost.toLocaleString()} FCFA` : "Gratuit"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2.5">
                        <Label className="text-slate-900 font-bold">Nom *</Label>
                        <Input 
                          placeholder="Votre nom" 
                          className="h-12 rounded-xl focus-visible:ring-blue-600/20 border-slate-200"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-slate-900 font-bold">Prénom(s) *</Label>
                        <Input 
                          placeholder="Vos prénoms" 
                          className="h-12 rounded-xl focus-visible:ring-blue-600/20 border-slate-200"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-slate-900 font-bold">Téléphone *</Label>
                        <Input 
                          placeholder="+225 ..." 
                          className="h-12 rounded-xl focus-visible:ring-blue-600/20 border-slate-200"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-slate-900 font-bold font-medium">Email</Label>
                        <Input 
                          type="email"
                          placeholder="exemple@email.com" 
                          className="h-12 rounded-xl focus-visible:ring-blue-600/20 border-slate-200"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2.5">
                        <Label className="text-slate-900 font-bold font-medium">Adresse</Label>
                        <Input 
                          placeholder="Commune, Quartier, Rue..." 
                          className="h-12 rounded-xl focus-visible:ring-blue-600/20 border-slate-200"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="text-slate-900 font-black uppercase text-xs tracking-widest text-blue-600">3. Statut dans l’église</Label>
                        <RadioGroup 
                          className="grid grid-cols-1 gap-3" 
                          value={formData.churchStatus}
                          onValueChange={(v) => setFormData({...formData, churchStatus: v})}
                        >
                          {[
                            { id: 'nouveau_membre', label: 'Nouveau membre' },
                            { id: 'membre_actif', label: 'Membre actif' },
                            { id: 'responsable', label: 'Responsable' },
                            { id: 'externe', label: 'Externe' }
                          ].map((item) => (
                            <div key={item.id} className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${
                              formData.churchStatus === item.id ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-white border-slate-100 hover:bg-slate-50'
                            }`}>
                              <RadioGroupItem value={item.id} id={item.id} className="text-blue-600 border-blue-200" />
                              <Label htmlFor={item.id} className="flex-1 cursor-pointer font-bold">{item.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-slate-900 font-black uppercase text-xs tracking-widest text-blue-600">4. Niveau actuel de foi / connaissance</Label>
                        <RadioGroup 
                          className="grid grid-cols-1 gap-3"
                          value={formData.currentLevel}
                          onValueChange={(v) => setFormData({...formData, currentLevel: v})}
                        >
                          {[
                            { id: 'debutant', label: 'Débutant', desc: 'Découverte des bases' },
                            { id: 'intermediaire', label: 'Intermédiaire', desc: 'Pratique régulière' },
                            { id: 'avance', label: 'Avancé', desc: 'Approfondissement théologique' }
                          ].map((item) => (
                            <div key={item.id} className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${
                              formData.currentLevel === item.id ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-white border-slate-100 hover:bg-slate-50'
                            }`}>
                              <RadioGroupItem value={item.id} id={`lvl-${item.id}`} className="text-indigo-600 border-indigo-200" />
                              <Label htmlFor={`lvl-${item.id}`} className="flex-1 cursor-pointer">
                                <p className="font-bold">{item.label}</p>
                                <p className="text-[10px] opacity-60 font-medium">{item.desc}</p>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-blue-600">
                        <MessageSquare className="w-5 h-5" />
                        <h3 className="font-black uppercase tracking-widest text-xs">5. Motivation</h3>
                      </div>
                      <div className="space-y-3">
                        <Label className="font-bold text-slate-700">Pourquoi souhaitez-vous suivre cette formation ? *</Label>
                        <Textarea 
                          placeholder="Partagez vos attentes et vos objectifs..." 
                          className="min-h-[140px] rounded-2xl focus-visible:ring-blue-600/20 border-slate-200 p-6 text-lg italic leading-relaxed"
                          value={formData.motivation}
                          onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-blue-600">
                        <History className="w-5 h-5" />
                        <h3 className="font-black uppercase tracking-widest text-xs">6. Expérience précédente</h3>
                      </div>
                      <div className="space-y-4">
                        <Label className="font-bold text-slate-700">Avez-vous déjà suivi une formation similaire ?</Label>
                        <RadioGroup 
                          defaultValue="non" 
                          className="flex gap-8"
                          value={formData.hasPreviousExperience}
                          onValueChange={(v) => setFormData({...formData, hasPreviousExperience: v})}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="oui" id="exp-oui" />
                            <Label htmlFor="exp-oui" className="font-bold">Oui</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="non" id="exp-non" />
                            <Label htmlFor="exp-non" className="font-bold">Non</Label>
                          </div>
                        </RadioGroup>

                        {formData.hasPreviousExperience === 'oui' && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="pt-2"
                          >
                            <Input 
                              placeholder="Laquelle ? (ex: Ecole des Disciples, CED...)" 
                              className="h-12 rounded-xl focus-visible:ring-blue-600/20 border-slate-200"
                              value={formData.previousExperienceDetails}
                              onChange={(e) => setFormData({...formData, previousExperienceDetails: e.target.value})}
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Calendar className="w-5 h-5" />
                        <h3 className="font-black uppercase tracking-widest text-xs">8. Disponibilité</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { id: 'matin', label: 'Matin', time: '08h - 12h' },
                          { id: 'apres_midi', label: 'Après-midi', time: '13h - 17h' },
                          { id: 'soir', label: 'Soir', time: '18h - 21h' }
                        ].map((period) => (
                          <div 
                            key={period.id}
                            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 ${
                              formData.availability.includes(period.id) ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white border-slate-100 hover:border-slate-300'
                            }`}
                            onClick={() => {
                              const newAvail = formData.availability.includes(period.id)
                                ? formData.availability.filter(a => a !== period.id)
                                : [...formData.availability, period.id];
                              setFormData({...formData, availability: newAvail});
                            }}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.availability.includes(period.id) ? 'bg-white/20' : 'bg-slate-50'}`}>
                               <Clock className="w-5 h-5" />
                            </div>
                            <div className="text-center">
                              <p className="font-bold">{period.label}</p>
                              <p className={`text-[10px] uppercase font-bold tracking-tighter opacity-60`}>{period.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-blue-600">
                        <CreditCard className="w-5 h-5" />
                        <h3 className="font-black uppercase tracking-widest text-xs">7. Paiement</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <Label className="font-bold">Type de participation</Label>
                          <RadioGroup 
                            className="grid grid-cols-1 gap-3"
                            value={training.cost && training.cost > 0 ? 'payant' : 'gratuit'}
                            disabled
                          >
                            <div className={`flex items-center space-x-3 p-4 rounded-xl border opacity-80 ${!training.cost || training.cost === 0 ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                              <RadioGroupItem value="gratuit" />
                              <Label className="font-bold">Gratuit</Label>
                            </div>
                            <div className={`flex items-center space-x-3 p-4 rounded-xl border opacity-80 ${training.cost && training.cost > 0 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                              <RadioGroupItem value="payant" />
                              <Label className="font-bold">Payant</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {training.cost && training.cost > 0 && (
                          <div className="space-y-4">
                            <Label className="font-bold">Moyen de paiement</Label>
                            <Select 
                              value={formData.selectedPaymentMethod}
                              onValueChange={(val) => setFormData({...formData, selectedPaymentMethod: val})}
                            >
                              <SelectTrigger className="h-14 rounded-xl">
                                <SelectValue placeholder="Choisir un mode de paiement" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="orange_money">Orange Money</SelectItem>
                                <SelectItem value="moov_money">Moov Money</SelectItem>
                                <SelectItem value="mtn_money">MTN Mobile Money</SelectItem>
                                <SelectItem value="wave">Wave</SelectItem>
                                <SelectItem value="virement">Virement bancaire</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Upload className="w-5 h-5" />
                        <h3 className="font-black uppercase tracking-widest text-xs">9. Documents</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                          { id: 'photo', label: 'Photo d\'identité', required: true },
                          { id: 'receipt', label: 'Reçu de paiement', required: training.cost && training.cost > 0 },
                          { id: 'certificate', label: 'Certificat précédent', required: false }
                        ].map((doc) => (
                          <div key={doc.id} className="relative group">
                            <Label className="text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-wider">
                              {doc.label} {doc.required && <span className="text-red-500">*</span>}
                            </Label>
                            <div className="border-2 border-dashed border-slate-200 hover:border-blue-300 transition-colors rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 group-hover:shadow-lg shadow-none">
                              <input 
                                type="file" 
                                className="hidden" 
                                id={`upload-${doc.id}`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  setFormData({
                                    ...formData,
                                    files: { ...formData.files, [doc.id]: file }
                                  });
                                }}
                              />
                              <label htmlFor={`upload-${doc.id}`} className="cursor-pointer space-y-3">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm mx-auto flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                                  {formData.files[doc.id as keyof typeof formData.files] ? <CheckCircle2 className="text-green-500" /> : <Upload className="w-6 h-6" />}
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-slate-900 leading-none">
                                    {formData.files[doc.id as keyof typeof formData.files]?.name || "Parcourir"}
                                  </p>
                                  <p className="text-[9px] text-slate-400 font-medium">PNG, JPG ou PDF</p>
                                </div>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900/5 p-8 rounded-3xl space-y-6">
                       <div className="flex items-center gap-2 text-slate-900 border-b border-slate-200 pb-4 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        <h3 className="font-black uppercase tracking-widest text-xs">10. Validation finale</h3>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm cursor-pointer" onClick={() => setFormData({...formData, commitment: !formData.commitment})}>
                        <Checkbox 
                          id="commitment" 
                          checked={formData.commitment}
                          onCheckedChange={(checked) => setFormData({...formData, commitment: !!checked})}
                          className="mt-1"
                        />
                        <div className="space-y-1">
                          <Label htmlFor="commitment" className="font-bold text-slate-900 cursor-pointer">
                            Engagement à suivre la formation
                          </Label>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Je m'engage à être assidu(e) et à respecter le règlement intérieur de la formation pour laquelle je m'inscris.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 shrink-0 gap-4 sm:justify-between items-center sm:flex-row flex-col">
              <div className="text-slate-400 text-[11px] font-bold italic w-full sm:w-auto text-center sm:text-left mb-4 sm:mb-0">
                {step < 3 ? "Vous pourrez réviser vos informations avant validation." : "En cliquant sur Valider, vous confirmez votre inscription."}
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                {step > 1 && (
                  <Button 
                    variant="outline" 
                    className="h-14 px-8 rounded-2xl font-bold border-slate-200 flex-1 sm:flex-none"
                    onClick={handleBack}
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" /> Retour
                  </Button>
                )}
                <Button 
                  className={`h-14 px-10 rounded-2xl font-bold transition-all flex-1 sm:flex-none ${step === 3 ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20' : 'bg-slate-900 hover:bg-black'}`}
                  onClick={step === totalSteps ? handleSubmit : handleNext}
                  disabled={isSubmitting || (step === 3 && !formData.commitment)}
                >
                  {isSubmitting ? (
                    'Traitement...'
                  ) : step === totalSteps ? (
                    training.cost && training.cost > 0 ? (
                      <>Payer et valider <ChevronRight className="w-5 h-5 ml-2" /></>
                    ) : (
                      <>S'inscrire <ChevronRight className="w-5 h-5 ml-2" /></>
                    )
                  ) : (
                    <>Continuer <ChevronRight className="w-5 h-5 ml-2" /></>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          /* Success / Confirmation Step */
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col p-12 overflow-y-auto custom-scrollbar"
          >
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 py-10">
              <div className="relative">
                <div className="w-32 h-32 bg-green-100 rounded-[40px] flex items-center justify-center text-green-600 mb-2 relative z-10 animate-pulse border-4 border-white shadow-2xl">
                  <CheckCircle2 className="w-16 h-16" />
                </div>
                <div className="absolute inset-0 bg-green-200 blur-3xl opacity-20 transform scale-150" />
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tight">Inscription Validée !</h2>
                <div className="bg-slate-50 border border-slate-200 py-3 px-8 rounded-2xl inline-block shadow-inner">
                  <span className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">ID INSCRIPTION</span>
                  <p className="text-2xl font-black text-blue-600 font-mono tracking-tighter mt-1">{registrationId}</p>
                </div>
                <p className="text-slate-500 max-w-md mx-auto text-lg leading-relaxed font-medium">
                  Votre demande pour la formation <span className="text-slate-900 font-bold">"{training.title}"</span> a été enregistrée avec succès.
                </p>
              </div>

              {/* QR Code & Badge (Visual only for now) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl px-4">
                {/* QR Code Ticket */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 flex flex-col items-center space-y-4 relative overflow-hidden group hover:shadow-2xl transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[80px] -mr-4 -mt-4 transition-all group-hover:scale-125" />
                  <div className="relative">
                    <QrCode className="w-40 h-40 text-slate-900" />
                    <div className="absolute inset-x-8 inset-y-16 flex items-center justify-center pointer-events-none">
                       <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                          <Trophy className="w-5 h-5" />
                       </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Pass Participant</p>
                    <p className="font-bold text-slate-900">QR-Check-In</p>
                  </div>
                </div>

                {/* Status & Next Steps */}
                <div className="bg-blue-600 rounded-3xl shadow-2xl p-8 text-white flex flex-col justify-between text-left relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                   <div>
                     <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-4 px-3 py-1.5 rounded-lg flex items-center gap-2 w-fit">
                        <Info className="w-3.5 h-3.5" /> Confirmation
                     </Badge>
                     <p className="text-2xl font-bold leading-tight mb-2">Quels sont les prochaines étapes ?</p>
                     <ul className="space-y-4 mt-6">
                        <li className="flex gap-3 text-sm font-bold opacity-90">
                           <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">1</div>
                           <span>Vous allez recevoir une confirmation par WhatsApp / Email d'ici 24H.</span>
                        </li>
                        <li className="flex gap-3 text-sm font-bold opacity-90">
                           <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">2</div>
                           <span>Le lien d'intégration dans le groupe de formation vous sera partagé.</span>
                        </li>
                     </ul>
                   </div>
                   
                   <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase opacity-50">Statut</p>
                        <p className="font-black text-lg">EN ATTENTE</p>
                      </div>
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex gap-4 w-full max-w-md pt-6">
                <Button 
                  className="flex-1 bg-slate-900 hover:bg-black text-white rounded-2xl h-16 font-bold text-lg shadow-xl"
                  onClick={() => onOpenChange(false)}
                >
                  Télécharger mon Badge
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 border-slate-200 rounded-2xl h-16 font-bold text-lg hover:bg-slate-50"
                  onClick={() => onOpenChange(false)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
