import React from 'react';
import { 
  Church as ChurchIcon, 
  Plus, 
  MapPin, 
  User, 
  Calendar,
  MoreVertical,
  Trash2,
  Edit2,
  ArrowRight,
  ChevronRight,
  Search,
  Filter,
  Users,
  Settings,
  Activity,
  History,
  FileText,
  Mail,
  Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from './ui/dialog';
import { Badge } from './ui/badge';
import { useStore, Church } from '../lib/store';
import { cn } from '../lib/utils';
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
} from './ui/form';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const churchSchema = z.object({
  name: z.string().min(2, "Nom de l'église requis"),
  address: z.string().min(2, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  country: z.string().min(2, "Pays requis"),
  phone: z.string().min(2, "Téléphone requis"),
  email: z.string().email("Email invalide"),
  description: z.string().min(10, "Description requise"),
  pastor: z.string().min(2, "Nom du pasteur requis"),
});

function ChurchDetail({ church, onClose }: { church: any; onClose: () => void }) {
  const { members, children } = useStore();
  const churchMembers = members.filter(m => m.churchId === church.id || (church.id === 'default' && !m.churchId));
  const churchChildren = children.filter(c => c.churchId === church.id || (church.id === 'default' && !c.churchId));
  const allPeople = [...churchMembers, ...churchChildren];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <ArrowRight className="w-5 h-5 rotate-180" />
        </Button>
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">{church.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
            {church.id === 'default' && <Badge className="bg-church-gold text-white">Siège</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList className="bg-slate-100 p-1">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="members">Adultes & Enfants ({allPeople.length})</TabsTrigger>
              <TabsTrigger value="departments">Départements</TabsTrigger>
              <TabsTrigger value="finances">Finances</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-church-green" />
                      Informations Générales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Code Église</span>
                      <span className="font-mono font-bold text-church-green">{church.code || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Adresse</span>
                      <span className="font-medium">{church.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ville</span>
                      <span className="font-medium">{church.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pasteur Responsable</span>
                      <span className="font-medium">{church.pastor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date de création</span>
                      <span className="font-medium">{format(new Date(church.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Mail className="w-4 h-4 text-church-gold" />
                      Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email</span>
                      <span className="font-medium">{church.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Téléphone</span>
                      <span className="font-medium">{church.phone}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">À propos de cette branche</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {church.description}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-church-green text-white border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[10px] uppercase font-bold opacity-70">Membres Actifs</p>
                    <p className="text-2xl font-bold">{churchMembers.length}</p>
                  </CardContent>
                </Card>
                <Card className="bg-church-gold text-white border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[10px] uppercase font-bold opacity-70">Départements</p>
                    <p className="text-2xl font-bold">5</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900 text-white border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[10px] uppercase font-bold opacity-70">Événements</p>
                    <p className="text-2xl font-bold">12</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <Card className="border-none shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Rechercher un membre..." className="pl-9 h-9 text-xs rounded-lg" />
                  </div>
                  <Button size="sm" variant="outline" className="h-9 text-xs">
                    <Filter className="w-3 h-3 mr-2" />
                    Filtrer
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membre</TableHead>
                      <TableHead>Rôle / Groupe</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPeople.slice(0, 50).map((person) => (
                      <TableRow key={person.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{person.firstName[0]}{person.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <p className="text-sm font-medium leading-none">{person.firstName} {person.lastName}</p>
                              <p className="text-[10px] font-mono font-bold text-church-gold mt-1">
                                <span className="text-[9px] text-slate-400 font-bold uppercase mr-1">Matricule:</span>
                                {person.matricule || '---'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {'groups' in person ? (person.groups.map(g => (
                              <Badge key={g} variant="secondary" className="text-[9px] h-4">{g}</Badge>
                            ))) : (
                              <Badge variant="outline" className="text-[9px] h-4 text-blue-600 bg-blue-50 border-blue-100">Enfant ({person.ageGroup})</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "border-none text-[10px] h-5",
                            person.status === 'active' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                          )}>
                            {person.status === 'active' ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-4 text-center border-t border-slate-100 italic text-[10px] text-slate-400">
                  Affichage des 5 derniers membres inscrits
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="departments" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Jeunesse', 'Lourange', 'Accueil', 'Evangélisation'].map((dept) => (
                    <Card key={dept} className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-bold">{dept}</CardTitle>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toast.info("Gestion des rôles bientôt disponible")}>
                          <Settings className="w-3 h-3 text-slate-400" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <Avatar key={i} className="h-6 w-6 ring-2 ring-white">
                            <AvatarFallback className="text-[8px] bg-slate-100">U{i}</AvatarFallback>
                          </Avatar>
                        ))}
                        <div className="h-6 w-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[8px] text-slate-400">+12</div>
                      </div>
                      <Button variant="outline" className="w-full h-8 text-[10px] border-dashed" onClick={() => toast.info("Accès à la modification du département")}>Modifier le département</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Activités Récentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Nouveau membre', detail: 'Jean Kouassi a rejoint', date: 'il y a 2h' },
                { label: 'Offrande enregistrée', detail: 'Culte du matin', date: 'Hier' },
                { label: 'Projet lancé', detail: 'Rénovation toiture', date: '2 jours' }
              ].map((act, i) => (
                <div key={i} className="flex gap-3 relative pb-4 border-l border-slate-100 pl-4 last:border-0 last:pb-0">
                  <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-church-gold ring-4 ring-white" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{act.label}</p>
                    <p className="text-[10px] text-slate-500">{act.detail}</p>
                    <p className="text-[9px] text-slate-300 mt-1">{act.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-[10px] text-slate-400">Voir tout l'historique</Button>
            </CardFooter>
          </Card>

          <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/5 rounded-full blur-2xl" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-church-gold uppercase text-[10px] font-bold tracking-wider">
                  <FileText className="w-3 h-3" />
                  Rapport du mois
                </div>
                <h3 className="text-lg font-serif font-bold">Générer le rapport mensuel</h3>
                <p className="text-white/60 text-[10px]">Collectez automatiquement les statistiques de fréquentation et financières.</p>
                <Button className="w-full bg-church-gold hover:bg-church-gold/90 text-white border-none h-10 text-xs">Télécharger PDF</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function ChurchManagement() {
  const { churches, members, addChurch, updateChurch, deleteChurch } = useStore();
  const [selectedChurchId, setSelectedChurchId] = React.useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [churchToDelete, setChurchToDelete] = React.useState<Church | null>(null);
  const [churchToEdit, setChurchToEdit] = React.useState<Church | null>(null);

  const form = useForm<z.infer<typeof churchSchema>>({
    resolver: zodResolver(churchSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      description: '',
      pastor: '',
    },
  });

  const editForm = useForm<z.infer<typeof churchSchema>>({
    resolver: zodResolver(churchSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      description: '',
      pastor: '',
    },
  });

  const onSubmit = (values: z.infer<typeof churchSchema>) => {
    addChurch({
      ...values,
      status: 'active'
    });
    setIsAddDialogOpen(false);
    form.reset();
    toast.success("Nouvelle branche ajoutée");
  };

  const onEditSubmit = (values: z.infer<typeof churchSchema>) => {
    if (churchToEdit) {
      updateChurch(churchToEdit.id, values);
      setIsEditDialogOpen(false);
      setChurchToEdit(null);
      toast.success("Branche mise à jour");
    }
  };

  const handleEdit = (church: Church) => {
    setChurchToEdit(church);
    editForm.reset({
      name: church.name,
      address: church.address,
      city: church.city,
      country: church.country,
      phone: church.phone,
      email: church.email,
      description: church.description,
      pastor: church.pastor,
    });
    setIsEditDialogOpen(true);
  };

  const selectedChurch = selectedChurchId === 'default' ? {
    id: 'default',
    name: 'Grace-Connect - Siège',
    address: 'Abidjan, Côte d\'Ivoire',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    pastor: 'Pasteur Principal Koffi',
    createdAt: '2010-01-01',
    email: 'siege@graceconnect.app',
    phone: '+225 00 00 00 00',
    description: 'Centre de coordination principal pour Grace-Connect.'
  } : churches.find(c => c.id === selectedChurchId);

  if (selectedChurch) {
    return <ChurchDetail church={selectedChurch} onClose={() => setSelectedChurchId(null)} />;
  }

  const handleDeleteConfirm = () => {
    if (churchToDelete) {
      deleteChurch(churchToDelete.id);
      setChurchToDelete(null);
      toast.info("Branche supprimée");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Gestion des Églises</h1>
          <p className="text-slate-500">Gérez vos différentes branches et lieux de culte.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={
            <Button className="bg-church-green hover:bg-church-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une Branche
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nouvelle Branche</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'église</FormLabel>
                      <FormControl>
                        <Input placeholder="Ekklesia - Branche Dakar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input placeholder="Dakar, Plateau" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Dakar" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays</FormLabel>
                        <FormControl>
                          <Input placeholder="Sénégal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+221..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@eglise.org" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Une brève description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pastor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pasteur Responsable</FormLabel>
                      <FormControl>
                        <Input placeholder="Pasteur Samuel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="w-full bg-church-green">Créer la branche</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Default Church / Headquarters */}
        <Card className="border-none shadow-sm overflow-hidden border-l-4 border-church-gold">
          <CardHeader className="bg-slate-50/50">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-church-gold/20 rounded-lg">
                <ChurchIcon className="w-6 h-6 text-church-gold" />
              </div>
              <Badge className="bg-church-gold text-church-green">Siège Central</Badge>
            </div>
            <CardTitle className="mt-4">Grace-Connect - Siège</CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Code:</span>
              <span className="text-[10px] font-mono font-bold text-church-gold">0001</span>
            </div>
            <CardDescription className="mt-1">Centre de coordination principal</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center text-sm text-slate-600">
              <MapPin className="w-4 h-4 mr-2 text-slate-400" />
              Abidjan, Côte d'Ivoire
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <User className="w-4 h-4 mr-2 text-slate-400" />
              Pasteur Principal Koffi
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              Établi en 2010
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t border-slate-100 flex justify-between">
            <div className="text-xs text-slate-500">
              <strong>{members.filter(m => m.churchId === 'default' || !m.churchId).length}</strong> Membres
            </div>
            <Button variant="ghost" size="sm" className="text-church-green" onClick={() => setSelectedChurchId('default')}>
              Gérer <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        {/* Dynamic Churches */}
        {churches.map((church) => (
          <Card key={church.id} className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-church-green/10 rounded-lg">
                  <ChurchIcon className="w-6 h-6 text-church-green" />
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleEdit(church)}
                  >
                    <Edit2 className="w-4 h-4 text-slate-400 hover:text-church-green" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setChurchToDelete(church)}
                  >
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                  </Button>
                </div>
              </div>
              <CardTitle className="mt-4">{church.name}</CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Code:</span>
                <span className="text-[10px] font-mono font-bold text-church-green">{church.code || '----'}</span>
              </div>
              <CardDescription className="mt-1">Branche locale</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                {church.address}, {church.city}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <User className="w-4 h-4 mr-2 text-slate-400" />
                {church.pastor}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                Créé le {format(new Date(church.createdAt), 'dd MMM yyyy', { locale: fr })}
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t border-slate-100 flex justify-between">
              <div className="text-xs text-slate-500">
                <strong>{members.filter(m => m.churchId === church.id).length}</strong> Membres
              </div>
              <Button variant="ghost" size="sm" className="text-church-green" onClick={() => setSelectedChurchId(church.id)}>
                Gérer <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!churchToDelete} onOpenChange={(open) => !open && setChurchToDelete(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
              <Trash2 className="w-8 h-8" />
            </div>
            <DialogTitle className="text-2xl font-serif font-bold text-center text-slate-900">Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center text-slate-600">
            Êtes-vous sûr de vouloir supprimer la branche <span className="font-bold text-slate-900">"{churchToDelete?.name}"</span> ? 
            Cette action est irréversible et supprimera toutes les données associées.
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="w-full sm:flex-1 h-12 rounded-xl font-bold border-slate-200"
              onClick={() => setChurchToDelete(null)}
            >
              Annuler
            </Button>
            <Button 
              className="w-full sm:flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={handleDeleteConfirm}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier la Branche</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'église</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {churchToEdit?.code && (
                <div className="space-y-2">
                  <FormLabel className="text-slate-500">Code Église (Lecture seule)</FormLabel>
                  <div className="h-10 px-3 py-2 bg-slate-50 rounded-md border border-slate-200 text-sm font-mono font-bold text-slate-600 flex items-center">
                    {churchToEdit.code}
                  </div>
                </div>
              )}
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="pastor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pasteur Responsable</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="w-full bg-church-green">Enregistrer les modifications</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
