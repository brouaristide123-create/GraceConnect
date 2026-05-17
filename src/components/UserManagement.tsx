import React, { useState, useMemo } from 'react';
import { useStore, User, AuditLog } from '../lib/store';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Key, 
  History, 
  Mail, 
  Phone, 
  Calendar, 
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from './ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from './ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { Checkbox } from './ui/checkbox';

const userSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  position: z.string().min(2, 'La fonction/poste est requise'),
  departmentId: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

export function UserManagement() {
  const { users, auditLogs, addUser, updateUser, deleteUser, addAuditLog, departments, currentUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
    },
  });

  const generateUniqueId = () => {
    const digits = Math.floor(100000 + Math.random() * 900000).toString();
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                     String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return digits + letters;
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.identifier && user.identifier.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const onSubmit = (values: UserFormValues) => {
    const generatedId = generateUniqueId();
    addUser({
      ...values,
      role: 'member', // Default role
      identifier: generatedId,
      resetPasswordRequired: true,
      churchId: currentUser?.churchId || '1',
    });
    addAuditLog({
      userId: currentUser?.id || '1',
      userName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Admin',
      action: 'Création',
      target: `Utilisateur: ${values.firstName} ${values.lastName} (${generatedId})`,
      details: `Fonction: ${values.position}`
    });
    setIsAddDialogOpen(false);
    form.reset();
    toast.success(`Utilisateur créé avec l'ID: ${generatedId}`);
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    updateUser(user.id, { status: newStatus });
    addAuditLog({
      userId: currentUser?.id || '1',
      userName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Admin',
      action: newStatus === 'active' ? 'Activation' : 'Désactivation',
      target: `Utilisateur: ${user.firstName} ${user.lastName}`,
    });
    toast.info(`Utilisateur ${newStatus === 'active' ? 'activé' : 'désactivé'}`);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>;
      case 'treasurer':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><ShieldCheck className="w-3 h-3 mr-1" /> Trésorier</Badge>;
      case 'responsible':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><ShieldAlert className="w-3 h-3 mr-1" /> Responsable</Badge>;
      default:
        return <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">Membre</Badge>;
    }
  };

  const generatePassword = () => {
    toast.info('Le mot de passe par défaut est : graceconnect');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Gestion des Utilisateurs</h1>
          <p className="text-slate-500">Gérez les accès, les rôles et la sécurité de la plateforme.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={
            <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
              <UserPlus className="w-4 h-4 mr-2" />
              Nouvel Utilisateur
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un utilisateur</DialogTitle>
              <DialogDescription>Créez un nouveau compte avec des permissions spécifiques.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonction/Poste</FormLabel>
                      <FormControl><Input placeholder="ex: Secrétaire, Assistant..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sécurité par défaut</p>
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Mot de passe : <code className="bg-slate-200 px-1 py-0.5 rounded font-bold text-slate-900">graceconnect</code>
                  </p>
                  <p className="text-[10px] text-slate-400 italic">L'utilisateur devra changer son mot de passe à la première connexion.</p>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full bg-slate-900">Créer le compte</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Utilisateurs</p>
                <h3 className="text-2xl font-bold">{users.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Comptes Actifs</p>
                <h3 className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Administrateurs</p>
                <h3 className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Activité (24h)</p>
                <h3 className="text-2xl font-bold">12</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="list">Liste des Comptes</TabsTrigger>
          <TabsTrigger value="responsible">Responsable Église</TabsTrigger>
          <TabsTrigger value="roles">Rôles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Rechercher un utilisateur..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <select 
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="admin">Admin</option>
                    <option value="treasurer">Trésorier</option>
                    <option value="responsible">Responsable</option>
                    <option value="member">Membre</option>
                  </select>
                  <select 
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Dernière Connexion</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "border-none",
                            user.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                          )}>
                            {user.status === 'active' ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            {user.lastLogin ? format(parseISO(user.lastLogin), 'dd MMM yyyy HH:mm', { locale: fr }) : 'Jamais'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                              <MoreVertical className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedUser(user);
                                  setIsDetailDialogOpen(true);
                                }}>
                                  <Eye className="w-4 h-4 mr-2" /> Voir détails
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" /> Modifier rôle
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                  {user.status === 'active' ? (
                                    <><UserX className="w-4 h-4 mr-2 text-rose-600" /> Désactiver</>
                                  ) : (
                                    <><UserCheck className="w-4 h-4 mr-2 text-emerald-600" /> Activer</>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-rose-600" onClick={() => deleteUser(user.id)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responsible" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.filter(u => u.role === 'responsible').map(user => (
              <Card key={user.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <div className="h-2 bg-slate-900" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <Badge className="bg-slate-100 text-slate-600 border-none">Responsable</Badge>
                  </div>
                  <div className="space-y-1 mb-6">
                    <h3 className="text-lg font-bold text-slate-900">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <Mail className="w-3 h-3" /> {user.email}
                    </p>
                    {user.departmentId && (
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3" /> {departments.find(d => d.id === user.departmentId)?.name || 'Département'}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-9 rounded-lg"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDetailDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" /> Profil
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {users.filter(u => u.role === 'responsible').length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Aucun responsable</h3>
                <p className="text-slate-500">Il n'y a pas encore de responsables enregistrés.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Administrateur
                </CardTitle>
                <CardDescription>Accès complet à toutes les fonctionnalités.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gestion des églises et utilisateurs
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Accès complet aux finances
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Configuration du système
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Suppression de données
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Trésorier
                </CardTitle>
                <CardDescription>Gestion exclusive des finances et cotisations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Enregistrement des transactions
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gestion des cotisations et projets
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Rapports financiers
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <XCircle className="w-4 h-4 text-slate-300" /> Gestion des utilisateurs
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-600" />
                  Responsable
                </CardTitle>
                <CardDescription>Gestion des départements et activités.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gestion des membres du département
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Création de formations et événements
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Suivi de progression
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <XCircle className="w-4 h-4 text-slate-300" /> Accès aux finances globales
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-600" />
                  Membre
                </CardTitle>
                <CardDescription>Lecture et participation aux activités.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Consultation des documents publics
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Inscription aux formations
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Consultation de son propre profil
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <XCircle className="w-4 h-4 text-slate-300" /> Modification de données
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedUser && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedUser.firstName} {selectedUser.lastName}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(selectedUser.role)}
                      <Badge className={selectedUser.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                        {selectedUser.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{selectedUser.phone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Créé le {format(parseISO(selectedUser.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sécurité</h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Dernière connexion</span>
                    <span className="font-medium">{selectedUser.lastLogin ? format(parseISO(selectedUser.lastLogin), 'dd/MM/yy HH:mm') : 'Jamais'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">2FA</span>
                    <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-200">Désactivé</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 mt-2">
                    <Lock className="w-3 h-3 mr-2" /> Réinitialiser MDP
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold">Historique récent</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {auditLogs.filter(log => log.userId === selectedUser.id).map(log => (
                    <div key={log.id} className="text-xs p-2 rounded-lg bg-slate-50 flex justify-between items-center">
                      <span>{log.action} - {log.target}</span>
                      <span className="text-slate-400">{format(parseISO(log.timestamp), 'dd/MM HH:mm')}</span>
                    </div>
                  ))}
                  {auditLogs.filter(log => log.userId === selectedUser.id).length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-4">Aucune activité récente enregistrée.</p>
                  )}
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Fermer</Button>
                <Button className="bg-slate-900">Modifier le profil</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
