import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Users, 
  MapPin, 
  Clock, 
  ChevronRight, 
  MoreVertical, 
  UserPlus, 
  QrCode, 
  CheckCircle2, 
  TrendingUp, 
  Share2, 
  Image as ImageIcon,
  LayoutGrid,
  List,
  Filter,
  Shield,
  Video,
  FileText,
  MessageSquare,
  ArrowRight,
  Trash2,
  ShoppingBag,
  Tag,
  Package,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useStore, Event, EventRegistration, EventTeam, Department, Member } from '../lib/store';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from './ui/form';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { cn } from '../lib/utils';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';

const eventSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  type: z.enum(['conference', 'crusade', 'seminar', 'concert', 'retreat', 'special', 'other']),
  customType: z.string().optional(),
  startDate: z.string().min(1, "La date de début est requise"),
  endDate: z.string().min(1, "La date de fin est requise"),
  location: z.string().min(2, "Le lieu est requis"),
  description: z.string().min(10, "La description doit être plus longue"),
  organizerId: z.string().optional(),
  capacityLimit: z.number().optional(),
  isPaid: z.boolean(),
  price: z.number().optional(),
  bannerUrl: z.string().optional(),
  churchId: z.string().min(1, "L'église est requise"),
  merchandise: z.array(z.object({
    name: z.string().min(1, "Nom requis"),
    description: z.string().optional(),
    price: z.number().min(0, "Prix invalide"), // Sales price
    purchasePrice: z.number().min(0, "Prix invalide").optional(), // Purchase price
    stock: z.number().min(0, "Stock invalide").optional(),
    imageUrls: z.array(z.string()).optional(),
  })).optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

const registrationSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Téléphone invalide"),
});

const teamSchema = z.object({
  name: z.enum(['welcome', 'security', 'media', 'logistics', 'other']),
  customName: z.string().optional(),
});

export function EventsManagement() {
  const { 
    events, 
    departments, 
    churches, 
    eventRegistrations,
    addEvent,
    updateEvent,
    deleteEvent
  } = useStore();

  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [isAddEventOpen, setIsAddEventOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [hasDeptOrganizer, setHasDeptOrganizer] = React.useState(false);

  const eventForm = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      type: 'conference',
      customType: '',
      startDate: '',
      endDate: '',
      location: '',
      description: '',
      organizerId: '',
      isPaid: false,
      bannerUrl: '',
      churchId: churches[0]?.id || '',
      merchandise: [],
    },
  });

  const { fields: merchFields, append: appendMerch, remove: removeMerch } = useFieldArray({
    control: eventForm.control,
    name: "merchandise"
  });

  const onAddEvent = (values: EventFormValues) => {
    addEvent({ ...values, status: 'upcoming' } as any);
    setIsAddEventOpen(false);
    eventForm.reset();
    toast.success("Événement créé avec succès");
  };

  const filteredEvents = events.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedEventId) {
    const event = events.find(e => e.id === selectedEventId);
    if (event) {
      return <EventDetail event={event} onBack={() => setSelectedEventId(null)} />;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Événements</h1>
          <p className="text-slate-500">Gérez vos conférences, croisades et séminaires.</p>
        </div>
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogTrigger render={<Button className="bg-church-gold hover:bg-church-gold/90 text-white" />}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Événement
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un événement</DialogTitle>
              <DialogDescription>Définissez les détails de votre prochain grand rassemblement.</DialogDescription>
            </DialogHeader>
            <Form {...eventForm}>
              <form onSubmit={eventForm.handleSubmit(onAddEvent)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={eventForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'événement</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: Conférence des Femmes..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={eventForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="conference">Conférence</SelectItem>
                            <SelectItem value="crusade">Croisade</SelectItem>
                            <SelectItem value="seminar">Séminaire</SelectItem>
                            <SelectItem value="concert">Concert</SelectItem>
                            <SelectItem value="retreat">Retraite</SelectItem>
                            <SelectItem value="special">Spécial</SelectItem>
                            <SelectItem value="other">Autres</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {eventForm.watch('type') === 'other' && (
                  <FormField
                    control={eventForm.control}
                    name="customType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Préciser le type d'événement</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Mariage, Anniversaire, Camp de jeunesse..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={eventForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Début</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={eventForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fin</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={eventForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieu</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Palais de la Culture..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-slate-500">Organisateur — Un département ?</FormLabel>
                  <div className="flex gap-3 mt-2">
                    <Button type="button" size="sm"
                      className={hasDeptOrganizer ? "bg-church-green text-white" : "bg-slate-100 text-slate-600"}
                      onClick={() => { setHasDeptOrganizer(true); }}
                    >Oui</Button>
                    <Button type="button" size="sm"
                      className={!hasDeptOrganizer ? "bg-church-gold text-white" : "bg-slate-100 text-slate-600"}
                      onClick={() => { setHasDeptOrganizer(false); eventForm.setValue('organizerId', ''); }}
                    >Non (l'Église elle-même)</Button>
                  </div>
                </FormItem>
                {hasDeptOrganizer && (
                  <FormField
                    control={eventForm.control}
                    name="organizerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Département organisateur</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir un département" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map(d => (
                              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={eventForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <textarea 
                          className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Détails de l'événement..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-church-gold" />
                      <h3 className="font-bold text-slate-900">Articles en vente (Merchandising)</h3>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => appendMerch({ name: '', price: 0, purchasePrice: 0, stock: 0, description: '', imageUrls: [] })}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Ajouter un article
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {merchFields.map((field, index) => (
                      <div key={field.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                          onClick={() => removeMerch(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <FormField
                            control={eventForm.control}
                            name={`merchandise.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel className="text-xs">Nom de l'article</FormLabel>
                                <FormControl>
                                  <Input placeholder="ex: Tee-shirt..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={eventForm.control}
                            name={`merchandise.${index}.purchasePrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs text-rose-500 font-bold">Prix d'achat</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field} 
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={eventForm.control}
                            name={`merchandise.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs text-emerald-600 font-bold">Prix de vente</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field} 
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          <FormField
                            control={eventForm.control}
                            name={`merchandise.${index}.stock`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Quantité en stock</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field} 
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={eventForm.control}
                            name={`merchandise.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-xs">Description/Taille (Optionnel)</FormLabel>
                                <FormControl>
                                  <Input placeholder="ex: Taille L, Noir..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 block">
                          Images de l'article (Max 5)
                        </label>
                        <FormField
                          control={eventForm.control}
                          name={`merchandise.${index}.imageUrls`}
                          render={({ field }) => {
                            const urls = field.value || [];
                            return (
                              <FormItem>
                                <FormControl>
                                  <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                      {urls.map((url, imgIndex) => (
                                        <div key={imgIndex} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                                          <img src={url} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                                          <button
                                            type="button"
                                            className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                            onClick={() => {
                                              const newUrls = [...urls];
                                              newUrls.splice(imgIndex, 1);
                                              field.onChange(newUrls);
                                            }}
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ))}
                                      {urls.length < 5 && (
                                        <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-church-gold hover:text-church-gold cursor-pointer transition-all">
                                          <Plus className="w-5 h-5" />
                                          <span className="text-[8px] font-bold uppercase mt-1">Ajouter</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                  field.onChange([...urls, reader.result as string]);
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                          />
                                        </label>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <Input 
                                        placeholder="Coller l'URL d'une image..." 
                                        className="h-8 text-[10px]"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.currentTarget;
                                            if (input.value && urls.length < 5) {
                                              field.onChange([...urls, input.value]);
                                              input.value = '';
                                            }
                                          }
                                        }}
                                      />
                                      <p className="text-[9px] text-slate-400 italic flex items-center">Appuyez sur Entrée pour ajouter via URL</p>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </div>
                      </div>
                    ))}
                    {merchFields.length === 0 && (
                      <p className="text-center text-slate-400 text-sm py-4 italic">
                        Aucun article à vendre pour cet événement.
                      </p>
                    )}
                  </div>
                </div>

                <FormField
                  control={eventForm.control}
                  name="bannerUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affiche principale</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {field.value ? (
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                              <img src={field.value} alt="Banner Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  type="button"
                                  onClick={() => field.onChange('')}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="aspect-video w-full rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => field.onChange(reader.result as string);
                                    reader.readAsDataURL(file);
                                  }
                                };
                                input.click();
                              }}
                            >
                              <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                <ImageIcon className="w-6 h-6 text-church-gold" />
                              </div>
                              <p className="mt-4 text-sm font-medium text-slate-700">Téléverser l'affiche</p>
                              <p className="text-xs text-slate-400 mt-1">Format paysage recommandé (max 5MB)</p>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-church-green">Créer l'événement</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Rechercher un événement..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-100">
          <Button 
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className={cn(
        "grid gap-6",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
      )}>
        {isAddEventOpen && (
          <Card 
            className={cn(
              "group border-2 border-dashed border-church-gold/30 shadow-none opacity-90 cursor-default overflow-hidden bg-church-gold/5",
              viewMode === 'list' ? "flex flex-row" : ""
            )}
          >
            <div 
              className={cn(
                "bg-slate-200/50 flex items-center justify-center relative overflow-hidden",
                viewMode === 'grid' ? "h-48 w-full" : "w-48 h-auto shrink-0"
              )}
            >
              {eventForm.watch('bannerUrl') ? (
                <img src={eventForm.watch('bannerUrl')} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <ImageIcon className="w-6 h-6 text-church-gold/40" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aperçu Affiche</span>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge className="bg-church-gold text-white text-[9px] uppercase font-bold animate-pulse">En cours de création</Badge>
              </div>
            </div>
            <CardContent className="p-6 flex-1">
              <div className="mb-4">
                <Badge variant="outline" className="capitalize text-slate-400 border-slate-200 bg-slate-50 text-[10px]">
                  {eventForm.watch('type') === 'other' ? (eventForm.watch('customType') || 'Autres') : 
                   eventForm.watch('type') === 'conference' ? 'Conférence' :
                   eventForm.watch('type') === 'crusade' ? 'Croisade' :
                   eventForm.watch('type') === 'seminar' ? 'Séminaire' :
                   eventForm.watch('type') === 'concert' ? 'Concert' :
                   eventForm.watch('type') === 'retreat' ? 'Retraite' : 'Spécial'}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-slate-400 font-serif italic">{eventForm.watch('name') || "Nom de l'événement"}</h3>
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{eventForm.watch('startDate') ? format(new Date(eventForm.watch('startDate')), 'dd MMM yyyy', { locale: fr }) : "Date non définie"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>{eventForm.watch('location') || "Lieu non défini"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredEvents.length === 0 && !isAddEventOpen ? (
          <div className="col-span-full text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-100">
            <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600">Aucun événement trouvé</h3>
            <p className="text-slate-400">Planifiez votre prochain rassemblement dès maintenant.</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const regs = eventRegistrations.filter(r => r.eventId === event.id);
            const organizer = departments.find(d => d.id === event.organizerId);
            
            return (
              <Card 
                key={event.id} 
                className={cn(
                  "group border-none shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden",
                  viewMode === 'list' ? "flex flex-row" : ""
                )}
                onClick={() => setSelectedEventId(event.id)}
              >
                <div 
                  className={cn(
                    "bg-slate-100 flex items-center justify-center",
                    viewMode === 'grid' ? "h-48 w-full" : "w-48 h-auto shrink-0"
                  )}
                >
                  {event.bannerUrl ? (
                    <img src={event.bannerUrl} alt={event.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <CalendarIcon className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <CardContent className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="capitalize text-church-gold border-church-gold/20 bg-church-gold/5">
                      {event.type === 'other' ? (event.customType || 'Autres') : 
                       event.type === 'conference' ? 'Conférence' :
                       event.type === 'crusade' ? 'Croisade' :
                       event.type === 'seminar' ? 'Séminaire' :
                       event.type === 'concert' ? 'Concert' :
                       event.type === 'retreat' ? 'Retraite' : 'Spécial'}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        event.status === 'upcoming' ? "bg-blue-100 text-blue-700" : 
                        event.status === 'ongoing' ? "bg-green-100 text-green-700 animate-pulse" : 
                        "bg-slate-100 text-slate-700"
                      )}>
                        {event.status === 'upcoming' ? 'À venir' : event.status === 'ongoing' ? 'En cours' : 'Terminé'}
                      </Badge>
                      {event.isPublished ? (
                        <Badge className="bg-church-gold/10 text-church-gold border-none">Publié</Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-400 border-slate-200">Brouillon</Badge>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{event.name}</h3>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{format(new Date(event.startDate), 'dd MMM yyyy', { locale: fr })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">{regs.length} inscrits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!event.isPublished && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-church-gold hover:bg-church-gold/5"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateEvent(event.id, { isPublished: true } as any);
                            toast.success("Événement publié");
                          }}
                        >
                          <Share2 className="w-3 h-3 mr-1" /> Publier
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-church-gold group-hover:translate-x-1 transition-transform">
                        Détails <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function EventDetail({ event, onBack }: { event: Event, onBack: () => void }) {
  const { 
    members, 
    departments, 
    eventRegistrations, 
    eventTeams,
    eventOrders,
    churches,
    updateEvent,
    addEventRegistration,
    updateEventRegistration,
    addEventTeam,
    updateEventTeam,
    deleteEventTeam,
    updateEventOrder,
    deleteEventOrder
  } = useStore();

  const [activeTab, setActiveTab] = React.useState('infos');
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);
  const [hasDeptOrganizerEdit, setHasDeptOrganizerEdit] = React.useState(!!event.organizerId);
  const [isAddTeamOpen, setIsAddTeamOpen] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState<EventTeam | null>(null);
  const [isManageTeamOpen, setIsManageTeamOpen] = React.useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [selectedMemberToAdd, setSelectedMemberToAdd] = React.useState<string>('');
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  const editForm = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: event.name,
      type: event.type as any,
      customType: event.customType || '',
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      description: event.description,
      organizerId: event.organizerId,
      capacityLimit: event.capacityLimit,
      isPaid: event.isPaid,
      price: event.price,
      bannerUrl: event.bannerUrl,
      churchId: event.churchId,
      merchandise: event.merchandise || [],
    },
  });

  const { fields: editMerchFields, append: appendEditMerch, remove: removeEditMerch } = useFieldArray({
    control: editForm.control,
    name: "merchandise"
  });

  const onUpdateEvent = (values: EventFormValues) => {
    updateEvent(event.id, values as any);
    setIsEditOpen(false);
    toast.success("Événement mis à jour avec succès");
  };

  const regs = eventRegistrations.filter(r => r.eventId === event.id);
  const teams = eventTeams.filter(t => t.eventId === event.id);
  const orders = eventOrders.filter(o => o.eventId === event.id);
  const organizer = departments.find(d => d.id === event.organizerId);

  const regForm = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '' }
  });

  const teamForm = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: 'welcome', customName: '' }
  });

  const onAddTeam = (values: z.infer<typeof teamSchema>) => {
    addEventTeam({
      eventId: event.id,
      name: values.name === 'other' ? (values.customName || 'Autre') : values.name,
      members: [],
      tasks: []
    });
    setIsAddTeamOpen(false);
    teamForm.reset();
    toast.success("Équipe créée");
  };

  const handleManageTeam = (team: EventTeam) => {
    setSelectedTeam(team);
    setIsManageTeamOpen(true);
  };

  const handleAddMemberToTeam = () => {
    if (!selectedTeam || !selectedMemberToAdd) return;
    if (selectedTeam.members.includes(selectedMemberToAdd)) {
      toast.error("Ce membre est déjà dans l'équipe");
      return;
    }

    const updatedMembers = [...selectedTeam.members, selectedMemberToAdd];
    updateEventTeam(selectedTeam.id, { members: updatedMembers });
    setSelectedTeam({ ...selectedTeam, members: updatedMembers });
    setSelectedMemberToAdd('');
    toast.success("Membre ajouté");
  };

  const handleRemoveMemberFromTeam = (memberId: string) => {
    if (!selectedTeam) return;
    const updatedMembers = selectedTeam.members.filter(id => id !== memberId);
    updateEventTeam(selectedTeam.id, { members: updatedMembers });
    setSelectedTeam({ ...selectedTeam, members: updatedMembers });
    toast.success("Membre retiré");
  };

  const handleAddTask = () => {
    if (!selectedTeam || !newTaskTitle.trim()) return;
    const newTask = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      isCompleted: false
    };
    const updatedTasks = [...selectedTeam.tasks, newTask];
    updateEventTeam(selectedTeam.id, { tasks: updatedTasks });
    setSelectedTeam({ ...selectedTeam, tasks: updatedTasks });
    setNewTaskTitle('');
    setIsAddTaskOpen(false);
    toast.success("Tâche ajoutée");
  };

  const toggleTaskStatus = (taskId: string) => {
    if (!selectedTeam) return;
    const updatedTasks = selectedTeam.tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    updateEventTeam(selectedTeam.id, { tasks: updatedTasks });
    setSelectedTeam({ ...selectedTeam, tasks: updatedTasks });
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
      let processedCount = 0;

      Array.from(files).forEach((file: File) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Fichier ${file.name} trop volumineux (max 5MB)`);
          processedCount++;
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          processedCount++;
          if (processedCount === files.length) {
            updateEvent(event.id, { galleryUrls: [...(event.galleryUrls || []), ...newImages] });
            toast.success(`${newImages.length} image(s) ajoutée(s)`);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleBannerUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux (max 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateEvent(event.id, { bannerUrl: reader.result as string });
        toast.success("Affiche principale mise à jour");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeGalleryImage = (url: string) => {
    updateEvent(event.id, { galleryUrls: (event.galleryUrls || []).filter(u => u !== url) });
    toast.success("Image retirée");
  };

  const handleDeleteTeam = (teamId: string) => {
    if (confirm("Voulez-vous vraiment supprimer cette équipe ?")) {
      deleteEventTeam(teamId);
      setIsManageTeamOpen(false);
      setSelectedTeam(null);
      toast.success("Équipe supprimée");
    }
  };

  const onRegister = (values: z.infer<typeof registrationSchema>) => {
    addEventRegistration({
      ...values,
      eventId: event.id,
      registeredAt: new Date().toISOString(),
      isCheckedIn: false,
      status: 'registered',
      qrCode: `EVT-${event.id.slice(0,4)}-${Math.random().toString(36).slice(2,8).toUpperCase()}`
    });
    setIsRegisterOpen(false);
    regForm.reset();
    toast.success("Inscription réussie !");
  };

  const [registrationType, setRegistrationType] = React.useState<'member' | 'guest'>('member');
  const [selectedMembersForReg, setSelectedMembersForReg] = React.useState<string[]>([]);
  const [memberRegSearch, setMemberRegSearch] = React.useState('');
  const [participantSearchTerm, setParticipantSearchTerm] = React.useState('');
  const [selectedParticipantsForCheckin, setSelectedParticipantsForCheckin] = React.useState<string[]>([]);

  const filteredMembersForReg = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberRegSearch.toLowerCase())
  );

  const handleBulkRegister = () => {
    selectedMembersForReg.forEach(memberId => {
      const m = members.find(mem => mem.id === memberId);
      if (m) {
        addEventRegistration({
          eventId: event.id,
          firstName: m.firstName,
          lastName: m.lastName,
          email: m.email || '',
          phone: m.phone || '',
          status: 'registered',
          registeredAt: new Date().toISOString(),
          isCheckedIn: false,
        });
      }
    });
    toast.success(`${selectedMembersForReg.length} membres inscrits`);
    setIsRegisterOpen(false);
    setSelectedMembersForReg([]);
  };

  const handleBulkCheckIn = () => {
    selectedParticipantsForCheckin.forEach(id => {
      updateEventRegistration(id, { 
        isCheckedIn: true,
        checkInTime: new Date().toISOString()
      });
    });
    toast.success(`${selectedParticipantsForCheckin.length} participants check-in`);
    setSelectedParticipantsForCheckin([]);
  };

  const [selectedDay, setSelectedDay] = React.useState<string>(
    format(new Date(event.startDate), 'yyyy-MM-dd')
  );

  const eventDays = React.useMemo(() => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const days = [];
    let current = new Date(start);
    while (current <= end) {
      days.push(format(new Date(current), 'yyyy-MM-dd'));
      current.setDate(current.getDate() + 1);
      // Safety break
      if (days.length > 31) break;
    }
    return days;
  }, [event.startDate, event.endDate]);

  const toggleDailyAttendance = (regId: string, date: string) => {
    const reg = regs.find(r => r.id === regId);
    if (!reg) return;
    
    const attendedDates = reg.attendedDates || [];
    const isAttending = attendedDates.includes(date);
    
    const newDates = isAttending 
      ? attendedDates.filter(d => d !== date)
      : [...attendedDates, date];
      
    updateEventRegistration(regId, { attendedDates: newDates });
    toast.success(isAttending ? "Présence supprimée" : "Présence enregistrée");
  };

  const handleBulkDailyCheckIn = () => {
    selectedParticipantsForCheckin.forEach(id => {
      const reg = regs.find(r => r.id === id);
      if (reg) {
        const attendedDates = reg.attendedDates || [];
        if (!attendedDates.includes(selectedDay)) {
          updateEventRegistration(id, { attendedDates: [...attendedDates, selectedDay] });
        }
      }
    });
    toast.success(`${selectedParticipantsForCheckin.length} participants pointés pour le ${selectedDay}`);
    setSelectedParticipantsForCheckin([]);
  };

  const toggleCheckIn = (regId: string, currentStatus: boolean) => {
    updateEventRegistration(regId, { 
      isCheckedIn: !currentStatus,
      checkInTime: !currentStatus ? new Date().toISOString() : undefined
    });
    toast.success(!currentStatus ? "Check-in effectué" : "Check-in annulé");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-serif font-bold text-slate-900">{event.name}</h1>
              <Badge variant="outline" className="capitalize text-church-gold border-church-gold/20 bg-church-gold/5">
                {event.type === 'other' ? (event.customType || 'Autres') : 
                 event.type === 'conference' ? 'Conférence' :
                 event.type === 'crusade' ? 'Croisade' :
                 event.type === 'seminar' ? 'Séminaire' :
                 event.type === 'concert' ? 'Concert' :
                 event.type === 'retreat' ? 'Retraite' : 'Spécial'}
              </Badge>
              <Badge className={cn(
                event.status === 'upcoming' ? "bg-blue-100 text-blue-700" : 
                event.status === 'ongoing' ? "bg-green-100 text-green-700" : 
                "bg-slate-100 text-slate-700"
              )}>
                {event.status === 'upcoming' ? 'À venir' : event.status === 'ongoing' ? 'En cours' : 'Terminé'}
              </Badge>
            </div>
            <p className="text-slate-500">{format(new Date(event.startDate), 'EEEE dd MMMM yyyy', { locale: fr })}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("Lien copié dans le presse-papier")}>
            <Share2 className="w-4 h-4 mr-2" /> Partager
          </Button>
          <Button className="bg-church-gold hover:bg-church-gold/90 text-white" onClick={() => setIsRegisterOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Inscrire quelqu'un
          </Button>
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            Modifier l'événement
          </Button>
          {!event.isPublished && (
            <Button className="bg-white text-church-gold border-church-gold hover:bg-church-gold/5" onClick={() => {
              updateEvent(event.id, { isPublished: true } as any);
              toast.success("Événement publié avec succès");
            }}>
              Publier
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="relative group aspect-video bg-slate-100 flex items-center justify-center">
              {event.bannerUrl ? (
                <img src={event.bannerUrl} alt={event.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <ImageIcon className="w-12 h-12 text-slate-300" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button size="sm" variant="secondary" onClick={() => bannerInputRef.current?.click()}>
                  <Plus className="w-3 h-3 mr-1" /> Modifier l'affiche
                </Button>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={bannerInputRef} 
                  onChange={handleBannerUpdate}
                />
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-church-gold/10 rounded-lg">
                    <CalendarIcon className="w-4 h-4 text-church-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Date</p>
                    <p className="font-medium">{format(new Date(event.startDate), 'dd MMM yyyy', { locale: fr })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-church-gold/10 rounded-lg">
                    <MapPin className="w-4 h-4 text-church-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Lieu</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-church-gold/10 rounded-lg">
                    <Users className="w-4 h-4 text-church-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Organisateur</p>
                    <p className="font-medium">{organizer?.name || 'Église'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-serif flex items-center gap-2 text-blue-700">
                <TrendingUp className="w-4 h-4" />
                Statistiques rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Remplissage</span>
                  <span className="font-bold">{regs.length} / {event.capacityLimit || '∞'}</span>
                </div>
                <Progress value={event.capacityLimit ? (regs.length / event.capacityLimit) * 100 : 100} className="h-1.5" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Présence (Check-in)</span>
                  <span className="font-bold">{regs.filter(r => r.isCheckedIn).length} / {regs.length}</span>
                </div>
                <Progress value={regs.length > 0 ? (regs.filter(r => r.isCheckedIn).length / regs.length) * 100 : 0} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-purple-50/50 border border-purple-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-serif flex items-center gap-2 text-purple-700">
                <TrendingUp className="w-4 h-4" />
                IA Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-purple-100 text-xs text-slate-600">
                <p className="font-bold text-purple-700 mb-1">Analyse de l'engagement</p>
                {regs.length > 0 ? (
                  `Basé sur les ${regs.length} inscrits, nous prévoyons un taux de présence de ${Math.round((regs.filter(r => r.isCheckedIn).length / regs.length) * 100 || 85)}%.`
                ) : (
                  "Commencez les inscriptions pour obtenir des prévisions de présence."
                )}
              </div>
              <div className="p-3 bg-white rounded-lg border border-purple-100 text-xs text-slate-600">
                <p className="font-bold text-purple-700 mb-1">Conseil Promotion</p>
                "Le type '{event.type === 'other' ? (event.customType || 'Autres') : 
                           event.type === 'conference' ? 'Conférence' :
                           event.type === 'crusade' ? 'Croisade' :
                           event.type === 'seminar' ? 'Séminaire' :
                           event.type === 'concert' ? 'Concert' :
                           event.type === 'retreat' ? 'Retraite' : 'Spécial'}' performe mieux avec des partages WhatsApp le mardi matin."
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white p-1 border border-slate-100 h-12">
              <TabsTrigger value="infos" className="data-[state=active]:bg-slate-50">
                <FileText className="w-4 h-4 mr-2" /> Infos
              </TabsTrigger>
              <TabsTrigger value="participants" className="data-[state=active]:bg-slate-50">
                <Users className="w-4 h-4 mr-2" /> Participants
              </TabsTrigger>
              <TabsTrigger value="teams" className="data-[state=active]:bg-slate-50">
                <Shield className="w-4 h-4 mr-2" /> Équipes
              </TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:bg-slate-50">
                <Video className="w-4 h-4 mr-2" /> Médias
              </TabsTrigger>
              <TabsTrigger value="merchandise" className="data-[state=active]:bg-slate-50">
                <ShoppingBag className="w-4 h-4 mr-2" /> Ventes
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-slate-50">
                <Tag className="w-4 h-4 mr-2" /> Commandes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="infos" className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>À propos de l'événement</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed">{event.description}</p>
                  
                  {event.speakers && event.speakers.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-lg font-bold text-slate-900 mb-4">Intervenants</h4>
                      <div className="flex flex-wrap gap-4">
                        {event.speakers.map((speaker, i) => (
                          <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback>{speaker[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-slate-700">{speaker}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-slate-900">Liste des inscrits ({regs.length})</h3>
                    {selectedParticipantsForCheckin.length > 0 && (
                      <Button 
                        className="h-8 bg-church-green text-xs" 
                        onClick={eventDays.length > 1 ? handleBulkDailyCheckIn : handleBulkCheckIn}
                      >
                        {eventDays.length > 1 ? `Pointer Jour (${selectedParticipantsForCheckin.length})` : `Check-in (${selectedParticipantsForCheckin.length})`}
                      </Button>
                    )}
                  </div>
                  
                  {eventDays.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {eventDays.map((day, i) => (
                        <Button 
                          key={day} 
                          variant={selectedDay === day ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "h-7 text-[10px] whitespace-nowrap",
                            selectedDay === day ? "bg-church-gold" : "text-slate-500"
                          )}
                          onClick={() => setSelectedDay(day)}
                        >
                          Jour {i + 1} ({format(new Date(day), 'dd MMM')})
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Rechercher un inscrit..." 
                      className="pl-9 h-9 text-xs"
                      value={participantSearchTerm}
                      onChange={(e) => setParticipantSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    const allIds = regs.filter(r => !r.isCheckedIn).map(r => r.id);
                    setSelectedParticipantsForCheckin(prev => 
                      prev.length === allIds.length ? [] : allIds
                    );
                  }}>
                    {selectedParticipantsForCheckin.length > 0 ? "Désélectionner" : "Tout"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" /> Exporter
                  </Button>
                </div>
              </div>

              <Card className="border-none shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-6 py-4 w-12">
                          {/* Checkbox for bulkhead selection */}
                        </th>
                        <th className="px-6 py-4">Participant</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Inscription</th>
                        <th className="px-6 py-4">Statut</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {regs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                            Aucun participant inscrit pour le moment.
                          </td>
                        </tr>
                      ) : (
                        regs.filter(r => 
                          `${r.firstName} ${r.lastName}`.toLowerCase().includes(participantSearchTerm.toLowerCase()) ||
                          r.email.toLowerCase().includes(participantSearchTerm.toLowerCase())
                        ).map((reg) => (
                          <tr key={reg.id} className={cn(
                            "hover:bg-slate-50/50 transition-colors",
                            selectedParticipantsForCheckin.includes(reg.id) ? "bg-church-gold/5" : ""
                          )}>
                            <td className="px-6 py-4">
                              {!reg.isCheckedIn && (
                                <Checkbox 
                                  checked={selectedParticipantsForCheckin.includes(reg.id)}
                                  onCheckedChange={() => {
                                    setSelectedParticipantsForCheckin(prev => 
                                      prev.includes(reg.id) ? prev.filter(id => id !== reg.id) : [...prev, reg.id]
                                    );
                                  }}
                                />
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-slate-100 text-slate-600">
                                    {reg.firstName[0]}{reg.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-slate-900">{reg.firstName} {reg.lastName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-slate-700">{reg.phone}</span>
                                <span className="text-[10px] text-slate-400">{reg.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {format(new Date(reg.registeredAt), 'dd/MM/yyyy')}
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={cn(
                                eventDays.length > 1 
                                  ? (reg.attendedDates?.includes(selectedDay) ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700")
                                  : (reg.isCheckedIn ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700")
                              )}>
                                 {eventDays.length > 1 
                                   ? (reg.attendedDates?.includes(selectedDay) ? 'Présent' : 'Absent')
                                   : (reg.isCheckedIn ? 'Présent' : 'Inscrit')}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button 
                                variant={eventDays.length > 1 
                                  ? (reg.attendedDates?.includes(selectedDay) ? "outline" : "default")
                                  : (reg.isCheckedIn ? "outline" : "default")
                                } 
                                size="sm"
                                className={cn(
                                  eventDays.length > 1 
                                    ? (!reg.attendedDates?.includes(selectedDay) && "bg-church-green")
                                    : (!reg.isCheckedIn && "bg-church-green")
                                )}
                                onClick={() => {
                                  if (eventDays.length > 1) {
                                    toggleDailyAttendance(reg.id, selectedDay);
                                  } else {
                                    toggleCheckIn(reg.id, reg.isCheckedIn);
                                  }
                                }}
                              >
                                 {eventDays.length > 1 
                                   ? (reg.attendedDates?.includes(selectedDay) ? 'Annuler' : 'Présent')
                                   : (reg.isCheckedIn ? 'Annuler' : 'Check-in')}
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="teams" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Équipes de service ({teams.length})</h3>
                <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
                  <DialogTrigger render={<Button size="sm" variant="outline" />}>
                    <Plus className="w-4 h-4 mr-2" /> Créer une équipe
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Nouvelle équipe</DialogTitle>
                      <DialogDescription>Ajoutez une équipe de service pour cet événement.</DialogDescription>
                    </DialogHeader>
                    <Form {...teamForm}>
                      <form onSubmit={teamForm.handleSubmit(onAddTeam)} className="space-y-4 py-4">
                        <FormField
                          control={teamForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type d'équipe</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choisir un type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="welcome">Accueil</SelectItem>
                                  <SelectItem value="security">Sécurité</SelectItem>
                                  <SelectItem value="media">Média</SelectItem>
                                  <SelectItem value="logistics">Logistique</SelectItem>
                                  <SelectItem value="other">Autre</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {teamForm.watch('name') === 'other' && (
                          <FormField
                            control={teamForm.control}
                            name="customName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom de l'équipe</FormLabel>
                                <FormControl>
                                  <Input placeholder="Saisir le nom..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <Button type="submit" className="w-full bg-church-gold text-white">Créer l'équipe</Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {teams.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-100">
                  <Shield className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600">Aucune équipe créée</h3>
                  <p className="text-slate-400 mb-6">Commencez par créer les équipes nécessaires au bon déroulement.</p>
                  <Button variant="outline" onClick={() => setIsAddTeamOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Créer la première équipe
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teams.map((team) => (
                    <Card key={team.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="w-4 h-4 text-church-gold" />
                          <span className="capitalize">
                            {team.name === 'welcome' ? 'Accueil' : 
                             team.name === 'security' ? 'Sécurité' : 
                             team.name === 'media' ? 'Média' : 
                             team.name === 'logistics' ? 'Logistique' : 'Autre'}
                          </span>
                        </CardTitle>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                          {team.members.length} membres
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex -space-x-2 overflow-hidden py-2">
                            {team.members.slice(0, 5).map(mid => {
                              const m = members.find(m => m.id === mid);
                              return (
                                <Avatar key={mid} className="w-8 h-8 border-2 border-white">
                                  <AvatarFallback className="bg-slate-100 text-[10px]">
                                    {m ? `${m.firstName[0]}${m.lastName[0]}` : '?'}
                                  </AvatarFallback>
                                </Avatar>
                              );
                            })}
                            {team.members.length > 5 && (
                              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">
                                +{team.members.length - 5}
                              </div>
                            )}
                            <button 
                              onClick={() => handleManageTeam(team)}
                              className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 hover:text-church-gold hover:border-church-gold transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tâches ({team.tasks.filter(t => t.isCompleted).length}/{team.tasks.length})</p>
                            {team.tasks.length > 0 ? (
                              <div className="space-y-1">
                                {team.tasks.slice(0, 2).map(task => (
                                  <div key={task.id} className="flex items-center gap-2 text-sm text-slate-600">
                                    <CheckCircle2 className={cn("w-3 h-3", task.isCompleted ? "text-green-500" : "text-slate-200")} />
                                    <span className={cn(task.isCompleted && "line-through text-slate-400")}>{task.title}</span>
                                  </div>
                                ))}
                                {team.tasks.length > 2 && (
                                  <p className="text-[10px] text-slate-400">+{team.tasks.length - 2} autres tâches</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500 italic">Aucune tâche assignée.</p>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-church-gold hover:bg-church-gold/5"
                            onClick={() => handleManageTeam(team)}
                          >
                            Gérer l'équipe
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Manage Team Dialog */}
              <Dialog open={isManageTeamOpen} onOpenChange={setIsManageTeamOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  {selectedTeam && (
                    <>
                      <DialogHeader>
                        <div className="flex items-center justify-between">
                          <DialogTitle className="flex items-center gap-2">
                            <span className="capitalize">
                              Équipe {selectedTeam.name === 'welcome' ? 'Accueil' : 
                               selectedTeam.name === 'security' ? 'Sécurité' : 
                               selectedTeam.name === 'media' ? 'Média' : 
                               selectedTeam.name === 'logistics' ? 'Logistique' : 'Autre'}
                            </span>
                          </DialogTitle>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 -mr-8"
                            onClick={() => handleDeleteTeam(selectedTeam.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Supprimer l'équipe
                          </Button>
                        </div>
                        <DialogDescription>Gérez les membres et les tâches de cette équipe.</DialogDescription>
                      </DialogHeader>

                      <Tabs defaultValue="members" className="mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="members">Membres ({selectedTeam.members.length})</TabsTrigger>
                          <TabsTrigger value="tasks">Tâches ({selectedTeam.tasks.length})</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="members" className="space-y-4 mt-4">
                          <div className="flex gap-2">
                            <Select value={selectedMemberToAdd} onValueChange={setSelectedMemberToAdd}>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Ajouter un membre..." />
                              </SelectTrigger>
                              <SelectContent>
                                {members.filter(m => !selectedTeam.members.includes(m.id)).map(m => (
                                  <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button onClick={handleAddMemberToTeam} disabled={!selectedMemberToAdd} className="bg-church-gold text-white">Ajouter</Button>
                          </div>

                          <div className="space-y-2">
                            {selectedTeam.members.map(mid => {
                              const m = members.find(m => m.id === mid);
                              if (!m) return null;
                              return (
                                <div key={mid} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback>{m.firstName[0]}{m.lastName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-bold">{m.firstName} {m.lastName}</p>
                                      <p className="text-[10px] text-slate-500">{m.phone}</p>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemoveMemberFromTeam(mid)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </TabsContent>

                        <TabsContent value="tasks" className="space-y-4 mt-4">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Liste des tâches</p>
                            <Button size="sm" variant="ghost" className="text-church-gold" onClick={() => setIsAddTaskOpen(true)}>
                              <Plus className="w-3 h-3 mr-1" /> Nouvelle tâche
                            </Button>
                          </div>

                          {isAddTaskOpen && (
                            <div className="flex gap-2 p-3 bg-church-gold/5 rounded-xl border border-church-gold/10">
                              <Input 
                                placeholder="Titre de la tâche..." 
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                className="flex-1"
                              />
                              <Button size="sm" className="bg-church-gold text-white" onClick={handleAddTask}>OK</Button>
                              <Button size="sm" variant="ghost" onClick={() => setIsAddTaskOpen(false)}>X</Button>
                            </div>
                          )}

                          <div className="space-y-2">
                            {selectedTeam.tasks.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-8 italic">Aucune tâche pour le moment.</p>
                            ) : (
                              selectedTeam.tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <button onClick={() => toggleTaskStatus(task.id)}>
                                      <CheckCircle2 className={cn(
                                        "w-5 h-5 transition-colors",
                                        task.isCompleted ? "text-green-500" : "text-slate-200 hover:text-slate-300"
                                      )} />
                                    </button>
                                    <span className={cn(
                                      "text-sm font-medium transition-all",
                                      task.isCompleted ? "text-slate-400 line-through" : "text-slate-700"
                                    )}>{task.title}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-church-gold" />
                    Commandes d'articles ({orders.length})
                  </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-y border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Client</th>
                        <th className="px-6 py-4">Article</th>
                        <th className="px-6 py-4">Qté</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Statut</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Aucune commande pour le moment.</td>
                        </tr>
                      ) : (
                        orders.map(order => {
                          const item = event.merchandise?.find(i => i.id === order.itemId);
                          return (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-bold text-slate-900">{order.customerName}</p>
                                <p className="text-[10px] text-slate-500">{order.customerPhone}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-medium">{item?.name || 'Article inconnu'}</span>
                              </td>
                              <td className="px-6 py-4 font-mono">{order.quantity}</td>
                              <td className="px-6 py-4 font-bold text-church-gold">{order.totalAmount.toLocaleString()} CFA</td>
                              <td className="px-6 py-4">
                                <Badge variant="outline" className={cn(
                                  "capitalize",
                                  order.status === 'paid' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                  order.status === 'delivered' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                  order.status === 'cancelled' ? "bg-rose-50 text-rose-700 border-rose-200" :
                                  "bg-amber-50 text-amber-700 border-amber-200"
                                )}>
                                  {order.status === 'pending' ? 'En attente' : 
                                   order.status === 'paid' ? 'Payé' :
                                   order.status === 'delivered' ? 'Livré' : 'Annulé'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Select 
                                  value={order.status} 
                                  onValueChange={(val) => updateEventOrder(order.id, { status: val as any })}
                                >
                                  <SelectTrigger className="w-[120px] h-8 text-xs ml-auto">
                                    <SelectValue placeholder="Changer" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">En attente</SelectItem>
                                    <SelectItem value="paid">Payé</SelectItem>
                                    <SelectItem value="delivered">Livré</SelectItem>
                                    <SelectItem value="cancelled">Annulé</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="merchandise" className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-church-gold" />
                    Articles en vente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!event.merchandise || event.merchandise.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                      <p className="text-slate-400 italic">Aucun article enregistré pour cet événement.</p>
                      <Button variant="outline" className="mt-4" onClick={() => toast.info("Modifiez l'événement pour ajouter des articles.")}>
                        Modifier l'événement
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {event.merchandise.map(item => (
                        <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-4">
                          {item.imageUrls && item.imageUrls.length > 0 && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 relative group">
                              <img src={item.imageUrls[0]} className="w-full h-full object-cover" alt={item.name} referrerPolicy="no-referrer" />
                              {item.imageUrls.length > 1 && (
                                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded font-bold">
                                  +{item.imageUrls.length - 1}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-slate-900">{item.name}</h4>
                              <div className="flex flex-col items-end gap-1">
                                <Badge className="bg-emerald-600 text-white border-none">{item.price.toLocaleString()} CFA (Vente)</Badge>
                                {item.purchasePrice && (
                                  <span className="text-[10px] text-rose-500 font-bold">Achat: {item.purchasePrice.toLocaleString()} CFA</span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-slate-500 mb-2 line-clamp-2">{item.description}</p>
                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <Package className="w-3 h-3" />
                                <span>{item.stock !== undefined ? `Stock: ${item.stock}` : "Stock illimité"}</span>
                              </div>
                              {item.purchasePrice && (
                                <div className="text-[10px] font-black text-slate-900">
                                  Marge: {(item.price - item.purchasePrice).toLocaleString()} CFA
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                        Affiches & Galerie Photos
                      </CardTitle>
                      <CardDescription>Gérez les visuels de l'événement.</CardDescription>
                    </div>
                    <Button 
                      className="bg-church-gold text-white" 
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Ajouter des images
                    </Button>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      ref={galleryInputRef}
                      onChange={handleGalleryUpload}
                    />
                  </CardHeader>
                  <CardContent>
                    {event.galleryUrls && event.galleryUrls.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {event.galleryUrls.map((url, i) => (
                          <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                            <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button 
                                variant="destructive" 
                                size="icon-xs"
                                onClick={() => removeGalleryImage(url)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <ImageIcon className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">Aucune image dans la galerie</p>
                        <p className="text-slate-400 text-xs mb-6">Ajoutez les affiches officiels et photos de l'événement.</p>
                        <Button variant="outline" onClick={() => galleryInputRef.current?.click()}>
                          Téléverser des photos
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Video className="w-5 h-5 text-slate-400" />
                      Vidéos & Replays
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500 mb-4 italic">Bientôt disponible : Intégration YouTube & Vimeo</p>
                    <Button variant="outline" disabled>Ajouter un lien</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Inscrire un participant</DialogTitle>
            <DialogDescription>Ajoutez des membres de l'église ou des invités extérieurs.</DialogDescription>
          </DialogHeader>
          
          <Tabs value={registrationType} onValueChange={(v) => setRegistrationType(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="member">Membres de l'église</TabsTrigger>
              <TabsTrigger value="guest">Invité Extérieur</TabsTrigger>
            </TabsList>
            
            <TabsContent value="member" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Chercher un membre..." 
                  className="pl-10"
                  value={memberRegSearch}
                  onChange={(e) => setMemberRegSearch(e.target.value)}
                />
              </div>
              
              <div className="border rounded-xl divide-y max-h-[300px] overflow-y-auto">
                {filteredMembersForReg.map(m => (
                  <div 
                    key={m.id} 
                    className={cn(
                      "flex items-center justify-between p-3 cursor-pointer",
                      selectedMembersForReg.includes(m.id) ? "bg-church-gold/5" : "hover:bg-slate-50"
                    )}
                    onClick={() => {
                      setSelectedMembersForReg(prev => 
                        prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]
                      );
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{m.firstName[0]}{m.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{m.firstName} {m.lastName}</p>
                        <p className="text-[10px] text-slate-500">{m.phone}</p>
                      </div>
                    </div>
                    <Checkbox checked={selectedMembersForReg.includes(m.id)} />
                  </div>
                ))}
              </div>
              
              <div className="pt-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">{selectedMembersForReg.length} sélectionné(s)</span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsRegisterOpen(false)}>Annuler</Button>
                  <Button 
                    className="bg-church-green" 
                    disabled={selectedMembersForReg.length === 0}
                    onClick={handleBulkRegister}
                  >
                    Confirmer l'inscription
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="guest" className="space-y-4">
              <Form {...regForm}>
                <form onSubmit={regForm.handleSubmit(onRegister)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={regForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={regForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
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
                      control={regForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={regForm.control}
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
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => setIsRegisterOpen(false)}>Annuler</Button>
                    <Button type="submit" className="bg-church-green">Inscrire l'invité</Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'événement</DialogTitle>
            <DialogDescription>Mettez à jour les informations de votre événement.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onUpdateEvent)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'événement</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Conférence des Femmes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="conference">Conférence</SelectItem>
                          <SelectItem value="crusade">Croisade</SelectItem>
                          <SelectItem value="seminar">Séminaire</SelectItem>
                          <SelectItem value="concert">Concert</SelectItem>
                          <SelectItem value="retreat">Retraite</SelectItem>
                          <SelectItem value="special">Spécial</SelectItem>
                          <SelectItem value="other">Autres</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {editForm.watch('type') === 'other' && (
                <FormField
                  control={editForm.control}
                  name="customType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Préciser le type d'événement</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Mariage, Anniversaire, Camp de jeunesse..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Début</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fin</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Palais de la Culture..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-slate-500">Organisateur — Un département ?</FormLabel>
                <div className="flex gap-3 mt-2">
                  <Button type="button" size="sm"
                    className={hasDeptOrganizerEdit ? "bg-church-green text-white" : "bg-slate-100 text-slate-600"}
                    onClick={() => { setHasDeptOrganizerEdit(true); }}
                  >Oui</Button>
                  <Button type="button" size="sm"
                    className={!hasDeptOrganizerEdit ? "bg-church-gold text-white" : "bg-slate-100 text-slate-600"}
                    onClick={() => { setHasDeptOrganizerEdit(false); editForm.setValue('organizerId', ''); }}
                  >Non (l'Église elle-même)</Button>
                </div>
              </FormItem>
              {hasDeptOrganizerEdit && (
                <FormField
                  control={editForm.control}
                  name="organizerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Département organisateur</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un département" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea 
                        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Détails de l'événement..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-church-gold" />
                    <h3 className="font-bold text-slate-900">Articles en vente (Merchandising)</h3>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => appendEditMerch({ name: '', price: 0, purchasePrice: 0, stock: 0, description: '', imageUrls: [] })}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Ajouter un article
                  </Button>
                </div>

                <div className="space-y-4">
                  {editMerchFields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                        onClick={() => removeEditMerch(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <FormField
                            control={editForm.control}
                            name={`merchandise.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel className="text-xs">Nom de l'article</FormLabel>
                                <FormControl>
                                  <Input placeholder="ex: Tee-shirt..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name={`merchandise.${index}.purchasePrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs text-rose-500 font-bold">Prix d'achat</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field} 
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name={`merchandise.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs text-emerald-600 font-bold">Prix de vente</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field} 
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          <FormField
                            control={editForm.control}
                            name={`merchandise.${index}.stock`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Quantité en stock</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field} 
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name={`merchandise.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-xs">Description/Taille (Optionnel)</FormLabel>
                                <FormControl>
                                  <Input placeholder="ex: Taille L, Noir..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 block">
                          Images de l'article (Max 5)
                        </label>
                        <FormField
                          control={editForm.control}
                          name={`merchandise.${index}.imageUrls`}
                          render={({ field }) => {
                            const urls = field.value || [];
                            return (
                              <FormItem>
                                <FormControl>
                                  <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                      {urls.map((url, imgIndex) => (
                                        <div key={imgIndex} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                                          <img src={url} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                                          <button
                                            type="button"
                                            className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                            onClick={() => {
                                              const newUrls = [...urls];
                                              newUrls.splice(imgIndex, 1);
                                              field.onChange(newUrls);
                                            }}
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ))}
                                      {urls.length < 5 && (
                                        <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-church-gold hover:text-church-gold cursor-pointer transition-all">
                                          <Plus className="w-5 h-5" />
                                          <span className="text-[8px] font-bold uppercase mt-1">Ajouter</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                  field.onChange([...urls, reader.result as string]);
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                          />
                                        </label>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <Input 
                                        placeholder="Coller l'URL d'une image..." 
                                        className="h-8 text-[10px]"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.currentTarget;
                                            if (input.value && urls.length < 5) {
                                              field.onChange([...urls, input.value]);
                                              input.value = '';
                                            }
                                          }
                                        }}
                                      />
                                      <p className="text-[9px] text-slate-400 italic flex items-center">Appuyez sur Entrée pour ajouter via URL</p>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {editMerchFields.length === 0 && (
                    <p className="text-center text-slate-400 text-sm py-4 italic">
                      Aucun article à vendre pour cet événement.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>Annuler</Button>
                <Button type="submit" className="bg-church-gold text-white">Mettre à jour l'événement</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
