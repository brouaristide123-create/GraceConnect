import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { useStore, Church } from '../../lib/store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../ui/dialog";
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function SuperAdminChurchList() {
  const { churches, updateChurch, deleteChurch, subscriptions, subscriptionPlans } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredChurches = churches.filter(church => {
    const matchesSearch = church.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         church.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || church.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: 'active' | 'suspended') => {
    updateChurch(id, { status: newStatus });
    toast.success(`Statut de l'église mis à jour : ${newStatus}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Actif</Badge>;
      case 'pending': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">En attente</Badge>;
      case 'suspended': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Suspendu</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 text-white">Gestion des Églises</h1>
          <p className="text-slate-500 mt-1">Gérez toutes les églises inscrites sur la plateforme.</p>
        </div>
        <Button className="bg-church-gold hover:bg-church-gold/90 text-white rounded-xl h-12 px-6 shadow-lg shadow-church-gold/20">
          Inscrire manuellement
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-3xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Rechercher par nom, ville..." 
                className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-church-gold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={statusFilter === 'all' ? 'default' : 'outline'} 
                className={`rounded-xl h-12 px-6 ${statusFilter === 'all' ? 'bg-slate-900' : 'border-slate-200'}`}
                onClick={() => setStatusFilter('all')}
              >
                Tous
              </Button>
              <Button 
                variant={statusFilter === 'active' ? 'default' : 'outline'} 
                className={`rounded-xl h-12 px-6 ${statusFilter === 'active' ? 'bg-emerald-600' : 'border-slate-200'}`}
                onClick={() => setStatusFilter('active')}
              >
                Actifs
              </Button>
              <Button 
                variant={statusFilter === 'pending' ? 'default' : 'outline'} 
                className={`rounded-xl h-12 px-6 ${statusFilter === 'pending' ? 'bg-amber-500' : 'border-slate-200'}`}
                onClick={() => setStatusFilter('pending')}
              >
                En attente
              </Button>
              <Button 
                variant={statusFilter === 'suspended' ? 'default' : 'outline'} 
                className={`rounded-xl h-12 px-6 ${statusFilter === 'suspended' ? 'bg-red-600' : 'border-slate-200'}`}
                onClick={() => setStatusFilter('suspended')}
              >
                Suspendus
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-y border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Église</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Localisation</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Responsable</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Abonnement</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Statut</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredChurches.map((church) => {
                  const sub = subscriptions.find(s => s.churchId === church.id);
                  const plan = subscriptionPlans.find(p => p.id === sub?.planId);
                  
                  return (
                    <tr key={church.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-church-gold/10 group-hover:text-church-gold transition-colors">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{church.name}</p>
                            <p className="text-xs text-slate-400 font-medium">ID: {church.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        <div className="flex flex-col">
                          <span className="font-medium">{church.city}</span>
                          <span className="text-xs text-slate-400">{church.country}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700">{church.pastor}</span>
                          <span className="text-xs text-slate-400">{church.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {plan ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className={`w-fit border-none ${
                              plan.id === 'premium' ? 'bg-amber-50 text-amber-700' :
                              plan.id === 'standard' ? 'bg-blue-50 text-blue-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {plan.name}
                            </Badge>
                            {sub && <span className="text-[10px] text-slate-400 italic">Exp: {format(parseISO(sub.expiryDate), 'dd/MM/yyyy')}</span>}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Aucun plan</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(church.status)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100" />}>
                            <MoreVertical className="w-5 h-5 text-slate-400" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-none shadow-xl">
                            <DropdownMenuItem 
                              className="rounded-xl gap-3 py-3"
                              onClick={() => {
                                setSelectedChurch(church);
                                setIsDetailOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4 text-slate-400" />
                              <span className="font-medium text-slate-700">Détails complets</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl gap-3 py-3">
                              <ShieldAlert className="w-4 h-4 text-slate-400" />
                              <span className="font-medium text-slate-700">Impersonification (Login as)</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {church.status === 'active' ? (
                              <DropdownMenuItem 
                                className="rounded-xl gap-3 py-3 text-red-600 focus:text-red-700 focus:bg-red-50"
                                onClick={() => handleStatusChange(church.id, 'suspended')}
                              >
                                <AlertCircle className="w-4 h-4" />
                                <span className="font-medium">Suspendre l'église</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="rounded-xl gap-3 py-3 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                                onClick={() => handleStatusChange(church.id, 'active')}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="font-medium">Activer l'église</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Church Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          {selectedChurch && (
            <>
              <div className="bg-slate-900 p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <Badge className="bg-church-gold/20 text-church-gold border-church-gold/20">
                    ID: {selectedChurch.id}
                  </Badge>
                  {getStatusBadge(selectedChurch.status)}
                </div>
                <h2 className="text-3xl font-serif font-bold mb-2">{selectedChurch.name}</h2>
                <p className="text-white/60 text-lg">{selectedChurch.description}</p>
              </div>

              <div className="p-8 grid grid-cols-2 gap-8 bg-white">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Informations de contact</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-sm font-medium">{selectedChurch.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-sm font-medium">{selectedChurch.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-sm font-medium">{selectedChurch.address}, {selectedChurch.city}, {selectedChurch.country}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Responsable</h4>
                    <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-church-gold/10 flex items-center justify-center text-church-gold font-bold">
                        {selectedChurch.pastor[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{selectedChurch.pastor}</p>
                        <p className="text-xs text-slate-500">Pasteur Principal</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Abonnement & Plateforme</h4>
                    <Card className="border-slate-100 shadow-none bg-slate-50/50 rounded-2xl overflow-hidden">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Plan actuel</span>
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                            Premium
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Inscrit le</span>
                          <span className="font-bold text-slate-900">{format(parseISO(selectedChurch.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Expiration</span>
                          <span className="font-bold text-slate-900 text-red-600">01/01/2025</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Membres</p>
                      <p className="text-2xl font-serif font-bold text-slate-900">1,240</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Activité</p>
                      <p className="text-2xl font-serif font-bold text-emerald-600">+15%</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="p-8 pt-0 border-none sm:justify-between gap-4">
                <Button 
                  variant="outline" 
                  className="rounded-xl h-12"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Fermer
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-xl h-12 text-red-600 border-red-100 hover:bg-red-50">Log Historique</Button>
                  <Button className="bg-slate-900 rounded-xl h-12 gap-2">
                    Gérer le compte <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
