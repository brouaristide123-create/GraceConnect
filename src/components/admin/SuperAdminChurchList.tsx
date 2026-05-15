import React, { useState } from 'react';
import {
  Building2,
  Search,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldAlert,
  ArrowUpRight,
  UserPlus,
  History,
  Settings,
  Users
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '../ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../lib/utils';

// Schema for manual church registration
const registerSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  address: z.string().min(2, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  country: z.string().min(2, "Pays requis"),
  phone: z.string().min(4, "Téléphone requis"),
  email: z.string().email("Email invalide"),
  description: z.string().min(5, "Description requise"),
  pastor: z.string().min(2, "Pasteur requis"),
});

export function SuperAdminChurchList() {
  const { churches, members, updateChurch, addChurch, subscriptions, subscriptionPlans } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const filteredChurches = churches.filter(church => {
    const matchesSearch =
      church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      church.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || church.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: 'active' | 'suspended') => {
    updateChurch(id, { status: newStatus });
    toast.success(`Statut mis à jour : ${newStatus === 'active' ? 'Activé' : 'Suspendu'}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">En attente</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Suspendu</Badge>;
      default:
        return null;
    }
  };

  // Manual registration form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      description: '',
      pastor: '',
    }
  });

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    addChurch({ ...values, status: 'active' });
    setIsRegisterOpen(false);
    registerForm.reset();
    toast.success("Église inscrite manuellement avec succès");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Gestion des Églises</h1>
          <p className="text-slate-500 mt-1">Gérez toutes les églises inscrites sur la plateforme.</p>
        </div>

        {/* Manual registration dialog */}
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogTrigger render={
            <Button className="bg-church-gold hover:bg-church-gold/90 text-white rounded-xl h-12 px-6 shadow-lg shadow-church-gold/20" />
          }>
            <UserPlus className="w-4 h-4 mr-2" />
            Inscrire manuellement
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Inscrire une Église Manuellement</DialogTitle>
            </DialogHeader>
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 py-2">
                <FormField control={registerForm.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'église</FormLabel>
                    <FormControl><Input placeholder="Église de la Grâce" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={registerForm.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl><Input placeholder="Abidjan" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={registerForm.control} name="country" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays</FormLabel>
                      <FormControl><Input placeholder="Côte d'Ivoire" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={registerForm.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl><Input placeholder="Quartier, rue..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={registerForm.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl><Input placeholder="+225 07..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={registerForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input placeholder="contact@eglise.org" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={registerForm.control} name="pastor" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pasteur Responsable</FormLabel>
                    <FormControl><Input placeholder="Pasteur Samuel" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={registerForm.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Input placeholder="Courte description de l'église..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit" className="w-full bg-church-gold text-white">Inscrire l'église</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm rounded-3xl">
        <CardContent className="p-6">
          {/* Search & filters */}
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
            <div className="flex gap-2 flex-wrap">
              {(['all', 'active', 'pending', 'suspended'] as const).map(f => (
                <Button
                  key={f}
                  variant={statusFilter === f ? 'default' : 'outline'}
                  className={cn(
                    'rounded-xl h-12 px-4',
                    statusFilter === f
                      ? f === 'all' ? 'bg-slate-900'
                        : f === 'active' ? 'bg-emerald-600'
                        : f === 'pending' ? 'bg-amber-500'
                        : 'bg-red-600'
                      : 'border-slate-200'
                  )}
                  onClick={() => setStatusFilter(f)}
                >
                  {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : f === 'pending' ? 'En attente' : 'Suspendus'}
                </Button>
              ))}
            </div>
          </div>

          {/* Table */}
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
                {filteredChurches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                      Aucune église trouvée
                    </td>
                  </tr>
                ) : (
                  filteredChurches.map((church) => {
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
                              <p className="text-xs text-slate-400 font-medium">Code: {church.code || church.id}</p>
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
                              <Badge variant="outline" className={cn(
                                'w-fit border-none',
                                plan.id === 'premium' ? 'bg-amber-50 text-amber-700' :
                                plan.id === 'standard' ? 'bg-blue-50 text-blue-700' :
                                'bg-slate-100 text-slate-700'
                              )}>
                                {plan.name}
                              </Badge>
                              {sub && (
                                <span className="text-[10px] text-slate-400 italic">
                                  Exp: {format(parseISO(sub.expiryDate), 'dd/MM/yyyy')}
                                </span>
                              )}
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
                            <DropdownMenuTrigger render={
                              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100" />
                            }>
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
                              <DropdownMenuItem
                                className="rounded-xl gap-3 py-3"
                                onClick={() => toast.info(`Impersonification de "${church.name}" — fonctionnalité réservée aux administrateurs`)}
                              >
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Church Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          {selectedChurch && (() => {
            const sub = subscriptions.find(s => s.churchId === selectedChurch.id);
            const plan = subscriptionPlans.find(p => p.id === sub?.planId);
            const churchMemberCount = members.filter(m => m.churchId === selectedChurch.id).length;

            return (
              <>
                <div className="bg-slate-900 p-8 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <Badge className="bg-church-gold/20 text-church-gold border-church-gold/20">
                      Code: {selectedChurch.code || selectedChurch.id}
                    </Badge>
                    {getStatusBadge(selectedChurch.status)}
                  </div>
                  <h2 className="text-3xl font-serif font-bold mb-2">{selectedChurch.name}</h2>
                  <p className="text-white/60 text-base">{selectedChurch.description}</p>
                </div>

                <div className="p-8 grid grid-cols-2 gap-8 bg-white">
                  {/* Left column */}
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
                        <div className="flex items-center gap-3 text-slate-600">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-sm font-medium">
                            Inscrite le {format(parseISO(selectedChurch.createdAt), 'dd MMMM yyyy', { locale: fr })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Responsable</h4>
                      <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-church-gold/10 flex items-center justify-center text-church-gold font-bold text-lg">
                          {selectedChurch.pastor[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{selectedChurch.pastor}</p>
                          <p className="text-xs text-slate-500">Pasteur Principal</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Abonnement & Plateforme</h4>
                      <Card className="border-slate-100 shadow-none bg-slate-50/50 rounded-2xl overflow-hidden">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Plan actuel</span>
                            {plan ? (
                              <Badge className={cn(
                                'border-none',
                                plan.id === 'premium' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                                plan.id === 'standard' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                                'bg-slate-100 text-slate-700 hover:bg-slate-100'
                              )}>
                                {plan.name}
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-600 border-none">Aucun plan</Badge>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Début abonnement</span>
                            <span className="font-bold text-slate-900">
                              {sub ? format(parseISO(sub.startDate), 'dd/MM/yyyy') : '—'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Expiration</span>
                            <span className={cn(
                              "font-bold",
                              sub && new Date(sub.expiryDate) < new Date() ? 'text-red-600' : 'text-slate-900'
                            )}>
                              {sub ? format(parseISO(sub.expiryDate), 'dd/MM/yyyy') : '—'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Statut</span>
                            {getStatusBadge(selectedChurch.status)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Membres</p>
                        </div>
                        <p className="text-2xl font-serif font-bold text-slate-900">{churchMemberCount.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Plan max</p>
                        <p className="text-sm font-bold text-slate-700">
                          {plan ? (plan.limits.members === 5000 ? '5 000' : plan.limits.members.toLocaleString()) : '—'}
                        </p>
                        <p className="text-[9px] text-slate-400">membres autorisés</p>
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
                    <Button
                      variant="outline"
                      className="rounded-xl h-12 text-slate-600 border-slate-200 gap-2"
                      onClick={() => {
                        toast.info(`Historique de "${selectedChurch.name}" — fonctionnalité en cours de développement`);
                      }}
                    >
                      <History className="w-4 h-4" />
                      Log Historique
                    </Button>
                    <Button
                      className="bg-slate-900 rounded-xl h-12 gap-2"
                      onClick={() => {
                        setIsDetailOpen(false);
                        toast.info(`Gestion du compte "${selectedChurch.name}" — accès complet depuis le tableau de bord`);
                      }}
                    >
                      Gérer le compte
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
