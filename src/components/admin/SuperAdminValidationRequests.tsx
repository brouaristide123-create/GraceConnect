import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  Send,
  MoreVertical
} from 'lucide-react';
import { useStore, Church } from '../../lib/store';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'motion/react';

export function SuperAdminValidationRequests() {
  const { churches, updateChurch } = useStore();
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [note, setNote] = useState('');

  const pendingChurches = churches.filter(c => c.status === 'pending');

  const handleValidation = (status: 'active' | 'suspended') => {
    if (!selectedChurch) return;
    updateChurch(selectedChurch.id, { status });
    toast.success(status === 'active' ? "Église validée avec succès" : "Demande rejetée");
    setIsValidationOpen(false);
    setSelectedChurch(null);
    setNote('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900">Validation des Inscriptions</h1>
        <p className="text-slate-500 mt-1">Gérez les demandes d'activation des nouvelles églises.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingChurches.length > 0 ? (
          pendingChurches.map((church, i) => (
            <motion.div
              key={church.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden group">
                <div className="bg-amber-50 p-4 flex items-center justify-between border-b border-amber-100/50">
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">En attente</Badge>
                  <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Nouveau
                  </span>
                </div>
                <CardHeader className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-church-gold/10 group-hover:text-church-gold transition-colors">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-serif font-bold">{church.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {church.city}, {church.country}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium truncate">{church.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{church.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <ShieldCheck className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium font-bold text-slate-900">{church.pastor}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex gap-2">
                  <Button 
                    className="flex-1 bg-slate-900 hover:bg-slate-800 rounded-xl rounded-xl h-11"
                    onClick={() => {
                      setSelectedChurch(church);
                      setIsValidationOpen(true);
                    }}
                  >
                    Examiner la demande
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-xl w-11 h-11 border-slate-200">
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="lg:col-span-3 py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900">Tout est à jour !</h3>
              <p className="text-slate-500">Aucune demande de validation en attente pour le moment.</p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isValidationOpen} onOpenChange={setIsValidationOpen}>
        <DialogContent className="sm:max-w-[600px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          {selectedChurch && (
            <>
              <div className="bg-amber-50 p-8 border-b border-amber-100 flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900">Examen de Demande</h2>
                  <p className="text-amber-700 font-medium">Reçu le {format(parseISO(selectedChurch.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nom de l'institution</p>
                    <p className="font-bold text-slate-900">{selectedChurch.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Localisation</p>
                    <p className="font-bold text-slate-900">{selectedChurch.city}, {selectedChurch.country}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responsable</p>
                    <p className="font-bold text-slate-900">{selectedChurch.pastor}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Direct</p>
                    <p className="font-bold text-slate-900">{selectedChurch.phone}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Commentaire / Note interne</p>
                    <span className="text-[10px] text-slate-400 italic">Visible uniquement par les admins</span>
                  </div>
                  <Textarea 
                    placeholder="Ajoutez une note ou un motif de refus/validation..." 
                    className="rounded-2xl bg-slate-50 border-none min-h-[100px] focus-visible:ring-church-gold"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <p className="text-sm text-emerald-800">
                    <span className="font-bold">Note automatique :</span> Les informations de contact semblent valides. Aucun doublon détecté pour cette adresse email.
                  </p>
                </div>
              </div>

              <DialogFooter className="p-8 pt-0 border-none flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="w-full sm:flex-1 h-12 rounded-xl text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 font-bold gap-2"
                  onClick={() => handleValidation('suspended')}
                >
                  <XCircle className="w-5 h-5" /> Rejeter
                </Button>
                <Button 
                  className="w-full sm:flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold gap-2"
                  onClick={() => handleValidation('active')}
                >
                  <ShieldCheck className="w-5 h-5" /> Valider l'inscription
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
