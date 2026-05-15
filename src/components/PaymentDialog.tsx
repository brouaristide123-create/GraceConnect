import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Smartphone, CreditCard, CheckCircle2, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  amount?: number;
  type: 'donation' | 'contribution' | 'event' | 'project';
  targetId?: string;
}

export function PaymentDialog({ isOpen, onClose, title, amount: initialAmount, type, targetId }: PaymentDialogProps) {
  const [step, setStep] = useState<'info' | 'method' | 'processing' | 'success'>('info');
  const [amount, setAmount] = useState(initialAmount?.toString() || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<string>('');

  const handleNext = () => {
    if (step === 'info') {
      if (!amount || !name || !phone) {
        toast.error('Veuillez remplir tous les champs');
        return;
      }
      setStep('method');
    } else if (step === 'method') {
      if (!method) {
        toast.error('Veuillez choisir une méthode de paiement');
        return;
      }
      setStep('processing');
      // Simulate payment processing
      setTimeout(() => {
        setStep('success');
      }, 3000);
    }
  };

  const handleBack = () => {
    if (step === 'method') setStep('info');
  };

  const resetAndClose = () => {
    setStep('info');
    setAmount(initialAmount?.toString() || '');
    setName('');
    setPhone('');
    setMethod('');
    onClose();
  };

  const paymentMethods = [
    { id: 'orange', name: 'Orange Money', icon: Smartphone, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'mtn', name: 'MTN MoMo', icon: Smartphone, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { id: 'moov', name: 'Moov Money', icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'card', name: 'Carte Bancaire', icon: CreditCard, color: 'text-slate-700', bg: 'bg-slate-50' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl">
        <AnimatePresence mode="wait">
          {step === 'info' && (
            <motion.div 
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-6"
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif">{title}</DialogTitle>
                <DialogDescription>
                  Contribuez à l'œuvre de Dieu en remplissant les informations ci-dessous.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant (FCFA)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="Ex: 5000" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input 
                    id="name" 
                    placeholder="Votre nom" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <Input 
                    id="phone" 
                    placeholder="Ex: 0707070707" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleNext} className="w-full bg-slate-900 h-12 text-white">
                  Continuer <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'method' && (
            <motion.div 
              key="method"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-6"
            >
              <div className="flex items-center gap-2 -ml-2 mb-2">
                <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <DialogTitle className="text-xl font-serif">Moyen de paiement</DialogTitle>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setMethod(pm.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      method === pm.id 
                        ? 'border-church-gold bg-slate-50' 
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${pm.bg}`}>
                        <pm.icon className={`w-5 h-5 ${pm.color}`} />
                      </div>
                      <span className="font-medium text-slate-700">{pm.name}</span>
                    </div>
                    {method === pm.id && <CheckCircle2 className="w-5 h-5 text-church-gold" />}
                  </button>
                ))}
              </div>

              <DialogFooter>
                <Button onClick={handleNext} className="w-full bg-slate-900 h-12 text-white">
                  Confirmer le paiement ({amount} FCFA)
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="relative">
                <Loader2 className="w-16 h-16 text-church-gold animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Paiement en cours...</h3>
                <p className="text-sm text-slate-500">Scannez le QR Code ou validez sur votre téléphone.</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 mx-auto">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ekklesia-payment" 
                  alt="QR Code" 
                  className="w-32 h-32 opacity-50 grayscale"
                />
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">Dieu vous bénisse !</h3>
                <p className="text-sm text-slate-500">Votre paiement de <span className="font-bold">{amount} FCFA</span> a été reçu avec succès.</p>
              </div>
              <div className="w-full pt-4 space-y-2">
                <Button className="w-full bg-slate-900 text-white" onClick={resetAndClose}>
                  Terminer
                </Button>
                <Button variant="outline" className="w-full" onClick={() => toast.success('Reçu téléchargé !')}>
                  Télécharger le reçu (PDF)
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
