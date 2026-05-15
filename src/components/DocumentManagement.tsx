import React from 'react';
import { 
  Folder, 
  FileText, 
  Search, 
  Plus, 
  MoreVertical, 
  Star, 
  Clock, 
  Download, 
  Share2, 
  Trash2, 
  Eye, 
  History, 
  Shield, 
  ChevronRight, 
  LayoutGrid, 
  List, 
  Filter, 
  File as FileIcon, 
  FileImage, 
  FileVideo, 
  FileSpreadsheet, 
  FileArchive,
  ArrowRight,
  Bell,
  Sparkles,
  Info,
  ExternalLink,
  Upload,
  FolderPlus,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Copy,
  Check,
  Cloud,
  Zap,
  HardDrive
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  useStore, 
  DocumentFolder, 
  DocumentFile, 
  DocumentVersion, 
  Member 
} from '../lib/store';
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
import { cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const fileSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  description: z.string().optional(),
  folderId: z.string().optional(),
  type: z.enum(['pdf', 'word', 'excel', 'image', 'video']),
  accessLevel: z.enum(['admin', 'responsible', 'public']),
  churchId: z.string().min(1, "Église requise"),
});

type FileFormValues = z.infer<typeof fileSchema>;

function FileIconComponent({ type, className }: { type: DocumentFile['type'], className?: string }) {
  switch (type) {
    case 'pdf': return <FileText className={cn("text-rose-500", className)} />;
    case 'word': return <FileIcon className={cn("text-blue-500", className)} />;
    case 'excel': return <FileSpreadsheet className={cn("text-emerald-500", className)} />;
    case 'image': return <FileImage className={cn("text-purple-500", className)} />;
    case 'video': return <FileVideo className={cn("text-orange-500", className)} />;
    default: return <FileIcon className={cn("text-slate-400", className)} />;
  }
}

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function DocumentDetail({ file, onClose }: { file: DocumentFile; onClose: () => void }) {
  const { members, documentVersions, toggleFavoriteDocument, deleteDocumentFile } = useStore();
  const author = members.find(m => m.id === file.authorId);
  const versions = documentVersions.filter(v => v.fileId === file.id).sort((a, b) => b.version - a.version);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
          <div className="flex items-center gap-3">
            <FileIconComponent type={file.type} className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">{file.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] uppercase">{file.type}</Badge>
                <Badge variant="secondary" className="text-[10px] capitalize">{file.accessLevel}</Badge>
                <span className="text-[10px] text-slate-400">v{file.version}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toggleFavoriteDocument(file.id)}>
            <Star className={cn("w-4 h-4 mr-2", file.isFavorite && "fill-amber-400 text-amber-400")} />
            {file.isFavorite ? 'Favori' : 'Ajouter aux favoris'}
          </Button>
          <Button size="sm" className="bg-church-green">
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="preview">
            <TabsList className="bg-slate-100 p-1">
              <TabsTrigger value="preview" className="text-xs">Aperçu</TabsTrigger>
              <TabsTrigger value="history" className="text-xs">Versions</TabsTrigger>
              <TabsTrigger value="access" className="text-xs">Accès</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-6">
              <Card className="border-none shadow-sm aspect-[4/3] flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200">
                <div className="text-center space-y-4">
                  <FileIconComponent type={file.type} className="w-16 h-16 mx-auto opacity-20" />
                  <p className="text-sm text-slate-400">Aperçu non disponible pour ce type de fichier.</p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ouvrir dans un nouvel onglet
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Historique des Versions</h3>
                <Button size="sm" variant="outline" className="text-xs">
                  <Upload className="w-3 h-3 mr-2" />
                  Nouvelle Version
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-blue-100 bg-blue-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                      v{file.version}
                    </div>
                    <div>
                      <p className="text-sm font-bold">Version Actuelle</p>
                      <p className="text-[10px] text-slate-500">Mise à jour le {format(new Date(file.updatedAt), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500">Actif</Badge>
                </div>
                {versions.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                        v{v.version}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Version {v.version}</p>
                        <p className="text-[10px] text-slate-500">Par {v.updatedBy} le {format(new Date(v.createdAt), 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs text-blue-600">Restaurer</Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="access" className="mt-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Gestion des Accès</CardTitle>
                  <CardDescription>Définissez qui peut consulter ou modifier ce document.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">Niveau d'accès requis</span>
                    </div>
                    <Select defaultValue={file.accessLevel}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="responsible">Responsable</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Description</p>
                <p className="text-xs text-slate-600 leading-relaxed">{file.description || 'Aucune description.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Taille</p>
                  <p className="text-xs font-medium">{formatSize(file.size)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Format</p>
                  <p className="text-xs font-medium uppercase">{file.type}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Auteur</p>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-[8px]">{author?.firstName[0]}{author?.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{author?.firstName} {author?.lastName}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <Button variant="outline" className="w-full text-xs h-8">
                  <Share2 className="w-3 h-3 mr-2" />
                  Partager le lien
                </Button>
                <Button variant="ghost" className="w-full text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => {
                  deleteDocumentFile(file.id);
                  onClose();
                  toast.success("Document supprimé");
                }}>
                  <Trash2 className="w-3 h-3 mr-2" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Bibliothèque Intelligente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <p className="text-xs font-bold">🔍 Recherche Avancée</p>
                <p className="text-[10px] text-slate-300 mt-1">L'IA peut indexer le contenu de vos PDF pour une recherche textuelle intégrale.</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <p className="text-xs font-bold">🔗 Documents Liés</p>
                <p className="text-[10px] text-slate-300 mt-1">Ce document est pertinent pour le <strong>Culte du 12 Avril</strong>.</p>
                <Button variant="link" className="h-auto p-0 text-[10px] text-blue-400 mt-1">Lier maintenant</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function DocumentManagement() {
  const { 
    documentFolders, 
    documentFiles, 
    members, 
    churches, 
    addDocumentFile, 
    addDocumentFolder, 
    deleteDocumentFolder,
    deleteDocumentFile,
    toggleFavoriteDocument 
  } = useStore();
  const [selectedFileId, setSelectedFileId] = React.useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);
  const [filterType, setFilterType] = React.useState<'all' | 'favorites' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isAddFolderDialogOpen, setIsAddFolderDialogOpen] = React.useState(false);
  const [isFolderPickerOpen, setIsFolderPickerOpen] = React.useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState('');
  const [selectedUploadFile, setSelectedUploadFile] = React.useState<File | null>(null);
  const [selectedFolders, setSelectedFolders] = React.useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const folders = filterType === 'all' 
    ? documentFolders.filter(f => f.parentId === (currentFolderId || undefined))
    : [];

  const files = filterType === 'favorites'
    ? documentFiles.filter(f => f.isFavorite)
    : filterType === 'recent'
    ? [...documentFiles].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10)
    : documentFiles.filter(f => f.folderId === (currentFolderId || undefined));

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const favorites = documentFiles.filter(f => f.isFavorite);
  const recentFiles = [...documentFiles].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  const currentFolder = documentFolders.find(f => f.id === currentFolderId);

  const form = useForm<FileFormValues>({
    resolver: zodResolver(fileSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      folderId: currentFolderId || undefined,
      type: 'pdf',
      accessLevel: 'public',
      churchId: churches[0]?.id || '1',
    },
  });

  React.useEffect(() => {
    form.setValue('folderId', currentFolderId || undefined);
  }, [currentFolderId, form]);

  const onSubmit = (values: FileFormValues) => {
    if (!selectedUploadFile) {
      toast.error("Veuillez sélectionner un fichier à téléverser");
      return;
    }

    addDocumentFile({
      ...values,
      folderId: (values.folderId === 'root' || !values.folderId) ? undefined : values.folderId,
      url: URL.createObjectURL(selectedUploadFile),
      size: selectedUploadFile.size,
      authorId: '1',
      isFavorite: false,
    });
    setIsAddDialogOpen(false);
    setSelectedUploadFile(null);
    form.reset();
    toast.success("Document ajouté avec succès");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedUploadFile(file);
      if (!form.getValues('name')) {
        form.setValue('name', file.name.split('.')[0]);
      }
      // Infer type if possible
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') form.setValue('type', 'pdf');
      else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) form.setValue('type', 'image');
      else if (['doc', 'docx'].includes(ext || '')) form.setValue('type', 'word');
      else if (['xls', 'xlsx'].includes(ext || '')) form.setValue('type', 'excel');
      else if (['mp4', 'mov', 'avi'].includes(ext || '')) form.setValue('type', 'video');
    }
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Veuillez donner un nom au dossier");
      return;
    }
    addDocumentFolder({
      name: newFolderName,
      parentId: currentFolderId || undefined,
      churchId: churches[0]?.id || '1'
    });
    setNewFolderName('');
    setIsAddFolderDialogOpen(false);
    toast.success("Dossier créé avec succès");
  };

  const handleBulkDelete = () => {
    if (selectedFolders.length === 0 && selectedFiles.length === 0) return;
    
    if (confirm(`Voulez-vous vraiment supprimer ${selectedFolders.length + selectedFiles.length} élément(s) ?`)) {
      selectedFolders.forEach(id => deleteDocumentFolder(id));
      selectedFiles.forEach(id => deleteDocumentFile(id));
      setSelectedFolders([]);
      setSelectedFiles([]);
      toast.success("Éléments supprimés avec succès");
    }
  };

  const toggleFolderSelection = (id: string) => {
    setSelectedFolders(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const toggleFileSelection = (id: string) => {
    setSelectedFiles(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const selectedFile = documentFiles.find(f => f.id === selectedFileId);

  if (selectedFile) {
    return <DocumentDetail file={selectedFile} onClose={() => setSelectedFileId(null)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Bibliothèque & Documents</h1>
          <p className="text-slate-500">Archive centrale et espace de travail collaboratif de l'église.</p>
        </div>
          <div className="flex gap-2">
            <Button 
                className="bg-church-green hover:bg-church-green/90 text-white shadow-lg shadow-church-green/20"
                onClick={() => {
                  if (documentFolders.length === 0) {
                    form.setValue('folderId', undefined);
                    setIsAddDialogOpen(true);
                  } else {
                    setIsFolderPickerOpen(true);
                  }
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Ajouter
              </Button>

            <Dialog open={isFolderPickerOpen} onOpenChange={setIsFolderPickerOpen}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Choisir un dossier de destination</DialogTitle>
                  <DialogDescription>Sélectionnez le dossier où vous souhaitez ajouter votre document.</DialogDescription>
                </DialogHeader>
                <div className="space-y-1 mt-4 max-h-[400px] overflow-y-auto pr-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      form.setValue('folderId', 'root');
                      setIsFolderPickerOpen(false);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    Racine (Tous les documents)
                  </Button>
                  {documentFolders.map(folder => (
                    <Button 
                      key={folder.id}
                      variant="ghost" 
                      className="w-full justify-start text-xs group"
                      onClick={() => {
                        form.setValue('folderId', folder.id);
                        setIsFolderPickerOpen(false);
                        setIsAddDialogOpen(true);
                      }}
                    >
                      <Folder className="w-4 h-4 mr-2 text-slate-400 group-hover:text-amber-400" />
                      {folder.name}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader><DialogTitle>Ajouter un document</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control as any}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du fichier</FormLabel>
                        <FormControl><Input placeholder="Ex: Rapport Financier Q1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control as any}
                    name="folderId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dossier de destination</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un dossier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="root">Racine</SelectItem>
                            {documentFolders.map(folder => (
                              <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="word">Word</SelectItem>
                              <SelectItem value="excel">Excel</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="video">Vidéo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="accessLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accès</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="responsible">Responsables</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control as any}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optionnel)</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div 
                    className={cn(
                      "p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer",
                      selectedUploadFile 
                        ? "border-church-green bg-emerald-50 text-emerald-600" 
                        : "border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-church-gold/50"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        setSelectedUploadFile(file);
                        if (!form.getValues('name')) {
                          form.setValue('name', file.name.split('.')[0]);
                        }
                      }
                    }}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileChange} 
                    />
                    {selectedUploadFile ? (
                      <>
                        <CheckCircle2 className="w-8 h-8 mb-2" />
                        <p className="text-xs font-bold">{selectedUploadFile.name}</p>
                        <p className="text-[10px] mt-1">{(selectedUploadFile.size / 1024 / 1024).toFixed(2)} MB • Prêt</p>
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-[10px] text-rose-500 mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUploadFile(null);
                          }}
                        >
                          Changer de fichier
                        </Button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-xs">Glissez-déposez votre fichier ici</p>
                        <p className="text-[10px] mt-1">Taille max: 50 MB</p>
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full bg-church-green">Valider l'Ajout</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar / Categories */}
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-9 h-9 text-xs" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Button 
              variant={filterType === 'all' && !currentFolderId ? "secondary" : "ghost"} 
              className="w-full justify-start text-xs h-9"
              onClick={() => {
                setFilterType('all');
                setCurrentFolderId(null);
              }}
            >
              <LayoutGrid className="w-4 h-4 mr-3" />
              Tous les documents
            </Button>
            <Button 
              variant={filterType === 'favorites' ? "secondary" : "ghost"} 
              className="w-full justify-start text-xs h-9"
              onClick={() => {
                setFilterType('favorites');
                setCurrentFolderId(null);
              }}
            >
              <Star className={cn("w-4 h-4 mr-3", filterType === 'favorites' ? "text-amber-500" : "text-amber-400")} />
              Favoris
            </Button>
            <Button 
              variant={filterType === 'recent' ? "secondary" : "ghost"} 
              className="w-full justify-start text-xs h-9"
              onClick={() => {
                setFilterType('recent');
                setCurrentFolderId(null);
              }}
            >
              <Clock className="w-4 h-4 mr-3 text-blue-400" />
              Récents
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">Dossiers</p>
            <div className="space-y-1">
              {documentFolders.filter(f => !f.parentId).map(folder => (
                <Button 
                  key={folder.id}
                  variant={filterType === 'all' && currentFolderId === folder.id ? "secondary" : "ghost"} 
                  className="w-full justify-start text-xs h-9 group"
                  onClick={() => {
                    setFilterType('all');
                    setCurrentFolderId(folder.id);
                  }}
                >
                  <Folder className={cn("w-4 h-4 mr-3", currentFolderId === folder.id ? "text-blue-500" : "text-slate-400 group-hover:text-blue-500")} />
                  {folder.name}
                </Button>
              ))}
              <Button 
                variant="ghost" 
                className="w-full justify-start text-xs h-9 text-slate-400 border-t border-dashed rounded-none mt-2"
                onClick={() => setIsAddFolderDialogOpen(true)}
              >
                <FolderPlus className="w-3 h-3 mr-3" />
                Nouveau dossier
              </Button>
            </div>
          </div>

          <Card className="border-none shadow-sm bg-blue-50/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-blue-600 uppercase">Stockage</span>
                <span className="text-slate-500">1.2 GB / 5 GB</span>
              </div>
              <Progress value={24} className="h-1 bg-blue-100" />
              <div className="flex justify-between items-center mt-1">
                <p className="text-[9px] text-slate-400">Vous utilisez 24% de votre espace.</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-[9px] font-bold text-blue-600 hover:bg-blue-100/50 flex items-center gap-1 group"
                  onClick={() => setIsUpgradeDialogOpen(true)}
                >
                  <Cloud className="w-3 h-3 group-hover:scale-110 transition-transform" />
                  Cloud +
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold text-slate-900">
                  {filterType === 'favorites' ? 'Favoris' : filterType === 'recent' ? 'Récents' : currentFolder ? currentFolder.name : 'Tous les documents'}
                </h2>
                {(currentFolder || filterType !== 'all' || searchQuery) && (
                  <Badge variant="outline" className="text-[10px]">
                    {filteredFiles.length + filteredFolders.length} éléments
                  </Badge>
                )}
              </div>
              
              {(selectedFolders.length > 0 || selectedFiles.length > 0) && (
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-tighter">
                    {selectedFolders.length + selectedFiles.length} sélectionnés
                  </span>
                  <div className="w-[1px] h-3 bg-rose-200 mx-1" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-full"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                    onClick={() => {
                      setSelectedFolders([]);
                      setSelectedFiles([]);
                    }}
                  >
                    <Plus className="w-3 h-3 rotate-45" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="sm" 
                className={cn(
                  "h-7 w-7 p-0 transition-colors", 
                  viewMode === 'grid' ? "bg-church-green text-black shadow-sm font-bold" : "hover:bg-slate-200"
                )}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="sm" 
                className={cn(
                  "h-7 w-7 p-0 transition-colors", 
                  viewMode === 'list' ? "bg-church-green text-black shadow-sm font-bold" : "hover:bg-slate-200"
                )}
                onClick={() => setViewMode('list')}
              >
                <List className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredFolders.map(folder => (
                <Card 
                  key={folder.id} 
                  className={cn(
                    "border-none shadow-sm hover:shadow-md transition-all cursor-pointer group relative",
                    selectedFolders.includes(folder.id) && "ring-2 ring-church-green bg-emerald-50/30"
                  )}
                  onClick={() => setCurrentFolderId(folder.id)}
                >
                  <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedFolders.includes(folder.id)}
                      onCheckedChange={() => toggleFolderSelection(folder.id)}
                      className={cn(
                        "data-[state=checked]:bg-church-green data-[state=checked]:border-church-green",
                        !selectedFolders.includes(folder.id) && "opacity-0 group-hover:opacity-100"
                      )}
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-church-green transition-all z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      form.setValue('folderId', folder.id);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                      <Folder className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{folder.name}</p>
                    <p className="text-[9px] text-slate-400 mt-1">Dossier</p>
                  </CardContent>
                </Card>
              ))}
              {filteredFiles.map(file => (
                <Card 
                  key={file.id} 
                  className={cn(
                    "border-none shadow-sm hover:shadow-md transition-all cursor-pointer group relative",
                    selectedFiles.includes(file.id) && "ring-2 ring-church-green bg-emerald-50/30"
                  )}
                  onClick={() => setSelectedFileId(file.id)}
                >
                  <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedFiles.includes(file.id)}
                      onCheckedChange={() => toggleFileSelection(file.id)}
                      className={cn(
                        "data-[state=checked]:bg-church-green data-[state=checked]:border-church-green",
                        !selectedFiles.includes(file.id) && "opacity-0 group-hover:opacity-100"
                      )}
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteDocument(file.id);
                    }}
                  >
                    <Star className={cn("w-3.5 h-3.5", file.isFavorite && "fill-amber-400 text-amber-400")} />
                  </Button>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-slate-100 transition-colors">
                      <FileIconComponent type={file.type} className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{file.name}</p>
                    <p className="text-[9px] text-slate-400 mt-1 uppercase">{file.type} • {formatSize(file.size)}</p>
                  </CardContent>
                </Card>
              ))}
              {filteredFolders.length === 0 && filteredFiles.length === 0 && (
                <div className="col-span-full h-48 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-2xl">
                  <FileArchive className="w-12 h-12 mb-3 opacity-10" />
                  <p className="text-sm italic">Aucun document trouvé.</p>
                  {filterType === 'all' && (
                    <Button variant="link" className="text-blue-500 text-xs mt-2" onClick={() => setIsAddDialogOpen(true)}>
                      Ajouter un document
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Card className="border-none shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={
                          (filteredFolders.length > 0 || filteredFiles.length > 0) &&
                          selectedFolders.length === filteredFolders.length && 
                          selectedFiles.length === filteredFiles.length
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFolders(filteredFolders.map(f => f.id));
                            setSelectedFiles(filteredFiles.map(f => f.id));
                          } else {
                            setSelectedFolders([]);
                            setSelectedFiles([]);
                          }
                        }}
                        className="data-[state=checked]:bg-church-green data-[state=checked]:border-church-green"
                      />
                    </TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Dernière modif.</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFolders.map(folder => (
                    <TableRow 
                      key={folder.id} 
                      className={cn("cursor-pointer", selectedFolders.includes(folder.id) && "bg-emerald-50/50")} 
                      onClick={() => setCurrentFolderId(folder.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedFolders.includes(folder.id)}
                          onCheckedChange={() => toggleFolderSelection(folder.id)}
                          className="data-[state=checked]:bg-church-green data-[state=checked]:border-church-green"
                        />
                      </TableCell>
                      <TableCell className="font-medium flex items-center gap-3">
                        <Folder className="w-4 h-4 text-blue-500" />
                        {folder.name}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">Dossier</TableCell>
                      <TableCell className="text-xs text-slate-500">-</TableCell>
                      <TableCell className="text-xs text-slate-500">{format(new Date(folder.createdAt), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-slate-400 hover:text-church-green"
                            onClick={(e) => {
                              e.stopPropagation();
                              form.setValue('folderId', folder.id);
                              setIsAddDialogOpen(true);
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredFiles.map(file => (
                    <TableRow 
                      key={file.id} 
                      className={cn("cursor-pointer", selectedFiles.includes(file.id) && "bg-emerald-50/50")} 
                      onClick={() => setSelectedFileId(file.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedFiles.includes(file.id)}
                          onCheckedChange={() => toggleFileSelection(file.id)}
                          className="data-[state=checked]:bg-church-green data-[state=checked]:border-church-green"
                        />
                      </TableCell>
                      <TableCell className="font-medium flex items-center gap-3">
                        <FileIconComponent type={file.type} className="w-4 h-4" />
                        {file.name}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 uppercase">{file.type}</TableCell>
                      <TableCell className="text-xs text-slate-500">{formatSize(file.size)}</TableCell>
                      <TableCell className="text-xs text-slate-500">{format(new Date(file.updatedAt), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger 
                            render={
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedFileId(file.id)}>
                              <Eye className="w-4 h-4 mr-2" /> Ouvrir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleFavoriteDocument(file.id)}>
                              <Star className={cn("w-4 h-4 mr-2", file.isFavorite && "fill-amber-400 text-amber-400")} /> 
                              {file.isFavorite ? 'Retirer favori' : 'Ajouter favori'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" /> Télécharger
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-rose-600">
                              <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Recent Activity / Favorites Section */}
          {!currentFolderId && filterType === 'all' && !searchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Documents Récents
                </h3>
                <div className="space-y-2">
                  {recentFiles.map(file => (
                    <div 
                      key={file.id} 
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedFileId(file.id)}
                    >
                      <div className="flex items-center gap-3">
                        <FileIconComponent type={file.type} className="w-4 h-4" />
                        <div>
                          <p className="text-xs font-bold">{file.name}</p>
                          <p className="text-[9px] text-slate-400">Modifié il y a {format(new Date(file.updatedAt), 'dd/MM/yyyy')}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  Favoris
                </h3>
                <div className="space-y-2">
                  {favorites.length > 0 ? favorites.map(file => (
                    <div 
                      key={file.id} 
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedFileId(file.id)}
                    >
                      <div className="flex items-center gap-3">
                        <FileIconComponent type={file.type} className="w-4 h-4" />
                        <div>
                          <p className="text-xs font-bold">{file.name}</p>
                          <p className="text-[9px] text-slate-400 uppercase">{file.type} • {formatSize(file.size)}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                    </div>
                  )) : (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-xl">
                      <p className="text-xs italic">Aucun favori pour le moment.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isAddFolderDialogOpen} onOpenChange={setIsAddFolderDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Nouveau dossier</DialogTitle>
            <DialogDescription>Créez un nouvel espace pour organiser vos documents.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label>Nom du dossier</Label>
            <Input 
              placeholder="Ex: Factures 2024, Photos Événements..." 
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddFolder();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFolderDialogOpen(false)}>Annuler</Button>
            <Button className="bg-church-green" onClick={handleAddFolder}>Créer le dossier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-500" />
              Augmenter l'espace Cloud
            </DialogTitle>
            <DialogDescription>
              Toutes les églises disposent de 5GB gratuits. Choisissez un forfait pour augmenter votre capacité.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-3 py-4">
            {[
              { id: 'free', name: 'Plan Standard', size: '5 GB', price: 'Gratuit', icon: Cloud, color: 'text-slate-400', active: true },
              { id: 'pro', name: 'Plan Pro', size: '20 GB', price: '9.99€ / mois', icon: Zap, color: 'text-amber-500', active: false },
              { id: 'premium', name: 'Plan Premium', size: '100 GB', price: '24.99€ / mois', icon: Sparkles, color: 'text-blue-500', active: false },
              { id: 'unlimited', name: 'Plan Illimité', size: '1 TB', price: '49.99€ / mois', icon: HardDrive, color: 'text-purple-500', active: false }
            ].map((plan) => (
              <div 
                key={plan.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer group",
                  plan.active 
                    ? "border-church-green bg-emerald-50/50" 
                    : "border-slate-100 hover:border-blue-100 hover:bg-blue-50/30"
                )}
                onClick={() => {
                  if (!plan.active) {
                    toast.success(`Demande pour le ${plan.name} envoyée !`);
                    setIsUpgradeDialogOpen(false);
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform", plan.color)}>
                    <plan.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{plan.name}</h4>
                    <p className="text-xs text-slate-500">{plan.size} d'espace de stockage</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">{plan.price}</p>
                  {plan.active && <p className="text-[9px] font-bold text-church-green uppercase mt-1">Actuel</p>}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsUpgradeDialogOpen(false)}>Annuler</Button>
            <Button className="bg-church-green hover:bg-church-green/90" onClick={() => setIsUpgradeDialogOpen(false)}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
