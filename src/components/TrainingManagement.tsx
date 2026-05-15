import React from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Target, 
  History, 
  Download, 
  ArrowRight, 
  Bell, 
  Sparkles, 
  FileText, 
  PlayCircle, 
  ChevronRight, 
  Info, 
  Award, 
  Layout, 
  MoreVertical, 
  MessageSquare, 
  Settings, 
  Trash2, 
  Edit, 
  Eye, 
  BookMarked, 
  HelpCircle, 
  FileVideo, 
  FileDown, 
  Share2, 
  Trophy, 
  Star,
  AlertCircle,
  Printer,
  ClipboardList,
  X 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
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
  DialogDescription,
  DialogClose
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  useStore, 
  Course, 
  CourseModule, 
  CourseLesson, 
  CourseEnrollment, 
  CourseQuiz, 
  CourseResource, 
  CourseSubject,
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
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

const courseSchema = z.object({
  title: z.string().min(2, "Titre requis"),
  description: z.string().min(10, "Description requise"),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  instructorId: z.string().min(1, "Formateur requis"),
  duration: z.string().min(1, "Durée requise"),
  churchId: z.string().min(1, "Église requise"),
});

const moduleSchema = z.object({
  title: z.string().min(2, "Titre du module requis"),
});

const lessonSchema = z.object({
  title: z.string().min(2, "Titre de la leçon requis"),
  content: z.string().min(10, "Contenu requis"),
  verse: z.string().optional(),
  videoUrl: z.string().optional(),
});

const resourceSchema = z.object({
  title: z.string().min(2, "Titre requis"),
  type: z.enum(['pdf', 'video', 'doc']),
});

const subjectSchema = z.object({
  name: z.string().min(2, "Nom de la matière requis"),
  coefficient: z.number().default(1),
});

type CourseFormValues = z.infer<typeof courseSchema>;
type ModuleFormValues = z.infer<typeof moduleSchema>;
type LessonFormValues = z.infer<typeof lessonSchema>;
type ResourceFormValues = z.infer<typeof resourceSchema>;
type SubjectFormValues = {
  name: string;
  coefficient: number;
};

function CourseDetail({ course, onClose }: { course: Course; onClose: () => void }) {
  const { 
    members, 
    courseModules, 
    courseLessons, 
    courseEnrollments, 
    courseResources, 
    courseQuizzes,
    courseSubjects,
    courseGrades,
    addCourseModule,
    updateCourseModule,
    deleteCourseModule,
    addCourseLesson,
    updateCourseLesson,
    deleteCourseLesson,
    addCourseResource,
    addCourseSubject,
    deleteCourseSubject,
    addCourseGrade,
    updateCourseGrade,
    enrollMember,
    updateProgress,
    updateCourseEnrollment
  } = useStore();

  const [activeTab, setActiveTab] = React.useState('modules');
  const [selectedLessonId, setSelectedLessonId] = React.useState<string | null>(null);

  // New states for interactive features
  const [isAddModuleOpen, setIsAddModuleOpen] = React.useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = React.useState(false);
  const [isAddResourceOpen, setIsAddResourceOpen] = React.useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = React.useState(false);
  const [selectedModuleId, setSelectedModuleId] = React.useState<string | null>(null);
  const [editingModuleId, setEditingModuleId] = React.useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isGPPEnabled, setIsGPPEnabled] = React.useState(true);
  const [isGPPToggleConfirmOpen, setIsGPPToggleConfirmOpen] = React.useState(false);
  const [selectedEnrollmentForBulletin, setSelectedEnrollmentForBulletin] = React.useState<string | null>(null);
  const [showAttendance, setShowAttendance] = React.useState(false);
  const [showGradesSheet, setShowGradesSheet] = React.useState(false);
  const [showCertificates, setShowCertificates] = React.useState(false);

  const modules = courseModules.filter(m => m.courseId === course.id).sort((a, b) => a.order - b.order);
  const enrollments = courseEnrollments.filter(e => e.courseId === course.id);
  const resources = courseResources.filter(r => r.courseId === course.id);
  const subjects = courseSubjects.filter(s => s.courseId === course.id);
  const quizzes = courseQuizzes.filter(q => q.courseId === course.id);
  const instructor = members.find(m => m.id === course.instructorId);

  const moduleForm = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { title: '' }
  });

  const lessonForm = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { title: '', content: '', verse: '', videoUrl: '' }
  });

  const resourceForm = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: { title: '', type: 'pdf' }
  });

  const subjectForm = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema) as any,
    defaultValues: { name: '', coefficient: 1 }
  });

  const onAddSubject = (values: SubjectFormValues) => {
    addCourseSubject({
      courseId: course.id,
      name: values.name,
      coefficient: values.coefficient
    });
    setIsAddSubjectOpen(false);
    subjectForm.reset();
    toast.success("Matière ajoutée");
  };

  const onAddModule = (values: ModuleFormValues) => {
    if (editingModuleId) {
      updateCourseModule(editingModuleId, { title: values.title });
      toast.success("Module mis à jour");
    } else {
      addCourseModule({
        courseId: course.id,
        title: values.title,
        order: modules.length + 1
      });
      toast.success("Module ajouté avec succès");
    }
    setIsAddModuleOpen(false);
    setEditingModuleId(null);
    moduleForm.reset();
  };

  const onAddLesson = (values: LessonFormValues) => {
    if (editingLessonId) {
      updateCourseLesson(editingLessonId, {
        title: values.title,
        content: values.content,
        verse: values.verse,
        videoUrl: values.videoUrl
      });
      toast.success("Leçon mise à jour");
    } else if (selectedModuleId) {
      const moduleLessons = courseLessons.filter(l => l.moduleId === selectedModuleId);
      addCourseLesson({
        moduleId: selectedModuleId,
        title: values.title,
        content: values.content,
        verse: values.verse,
        videoUrl: values.videoUrl,
        order: moduleLessons.length + 1
      });
      toast.success("Leçon ajoutée avec succès");
    }
    setIsAddLessonOpen(false);
    setEditingLessonId(null);
    setSelectedModuleId(null);
    lessonForm.reset();
  };

  const onAddResource = (values: ResourceFormValues) => {
    if (!selectedFile && values.type !== 'video') {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    addCourseResource({
      courseId: course.id,
      title: values.title,
      type: values.type,
      url: selectedFile ? URL.createObjectURL(selectedFile) : '#' 
    });
    setIsAddResourceOpen(false);
    setSelectedFile(null);
    resourceForm.reset();
    toast.success("Ressource ajoutée avec succès");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title if empty
      if (!resourceForm.getValues('title')) {
        resourceForm.setValue('title', file.name.split('.')[0]);
      }
    }
  };

  const handleLessonCompletion = (memberId: string, lessonId: string, isCompleted: boolean) => {
    const enrollment = enrollments.find(e => e.memberId === memberId);
    if (!enrollment) return;

    let updatedCompletedLessons = [...enrollment.completedLessons];
    if (isCompleted) {
      if (!updatedCompletedLessons.includes(lessonId)) {
        updatedCompletedLessons.push(lessonId);
      }
    } else {
      updatedCompletedLessons = updatedCompletedLessons.filter(id => id !== lessonId);
    }

    const totalLessons = courseLessons.filter(l => modules.some(m => m.id === l.moduleId)).length;
    const progress = totalLessons > 0 ? (updatedCompletedLessons.length / totalLessons) * 100 : 0;

    updateCourseEnrollment(enrollment.id, {
      completedLessons: updatedCompletedLessons,
      progress,
      status: progress === 100 ? 'completed' : 'enrolled'
    });
    toast.success(isCompleted ? "Présence marquée" : "Participation retirée");
  };

  const averageProgress = enrollments.length > 0 
    ? enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length 
    : 0;

  const handleEnroll = (memberId: string) => {
    if (enrollments.some(e => e.memberId === memberId)) {
      toast.error("Déjà inscrit");
      return;
    }
    enrollMember(course.id, memberId);
    toast.success("Inscription réussie");
  };

  const selectedLesson = courseLessons.find(l => l.id === selectedLessonId);

  if (showAttendance) {
    return (
      <AttendanceSheetView 
        course={course}
        enrollments={enrollments}
        members={members}
        onBack={() => setShowAttendance(false)}
      />
    );
  }

  if (showGradesSheet) {
    return (
      <GradesSheetView 
        course={course}
        enrollments={enrollments}
        members={members}
        subjects={subjects}
        courseGrades={courseGrades}
        onBack={() => setShowGradesSheet(false)}
      />
    );
  }

  if (showCertificates) {
    return (
      <CertificatesView 
        course={course}
        enrollments={enrollments}
        members={members}
        subjects={subjects}
        courseGrades={courseGrades}
        onBack={() => setShowCertificates(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">{course.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="capitalize">{course.level}</Badge>
              <Badge className={cn(
                course.status === 'ongoing' ? "bg-emerald-100 text-emerald-700" : 
                course.status === 'completed' ? "bg-slate-100 text-slate-700" : 
                "bg-blue-100 text-blue-700"
              )}>
                {course.status === 'ongoing' ? 'En cours' : course.status === 'completed' ? 'Terminé' : 'À venir'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
          <Button size="sm" className="bg-church-gold text-white">
            <Award className="w-4 h-4 mr-2" />
            Certificats
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-100 p-1 w-full justify-start overflow-x-auto">
              <TabsTrigger value="modules" className="text-xs">Modules & Leçons</TabsTrigger>
              <TabsTrigger value="participants" className="text-xs">Participants</TabsTrigger>
              <TabsTrigger value="progress" className="text-xs">Progression</TabsTrigger>
              <TabsTrigger value="notes" className="text-xs">Notes & Bulletins</TabsTrigger>
              <TabsTrigger value="resources" className="text-xs">Ressources</TabsTrigger>
            </TabsList>

            <TabsContent value="modules" className="space-y-6 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold font-serif">Parcours Pédagogique</h3>
                <Button size="sm" className="bg-church-gold hover:bg-church-gold/90 text-white shadow-sm" onClick={() => {
                  setEditingModuleId(null);
                  moduleForm.reset({ title: '' });
                  setIsAddModuleOpen(true);
                }}>
                  <Plus className="w-3 h-3 mr-2" />
                  Nouveau Module
                </Button>
              </div>

              <div className="space-y-4">
                {modules.map((module, mIdx) => {
                  const lessons = courseLessons.filter(l => l.moduleId === module.id).sort((a, b) => a.order - b.order);
                  return (
                    <Card key={module.id} className="border-none shadow-md overflow-hidden group">
                      <CardHeader className="bg-slate-50/50 py-3 group-hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-church-gold/10 text-church-gold flex items-center justify-center text-xs font-bold border border-church-gold/20">
                              {mIdx + 1}
                            </div>
                            <CardTitle className="text-sm font-bold text-slate-800">{module.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] bg-white border border-slate-200">{lessons.length} séances</Badge>
                            <div className="flex items-center gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingModuleId(module.id);
                                  moduleForm.setValue('title', module.title);
                                  setIsAddModuleOpen(true);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm("Voulez-vous vraiment supprimer ce module et toutes ses leçons ?")) {
                                    deleteCourseModule(module.id);
                                    toast.success("Module supprimé");
                                  }
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                          {lessons.map((lesson, lIdx) => (
                            <div 
                              key={lesson.id} 
                              className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors group/item"
                              onClick={() => setSelectedLessonId(lesson.id)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover/item:bg-church-gold/10 group-hover/item:text-church-gold transition-colors">
                                  <PlayCircle className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-700 group-hover/item:text-slate-900">{lesson.title}</p>
                                  {lesson.verse && <p className="text-[10px] text-slate-400 italic font-serif">{lesson.verse}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingLessonId(lesson.id);
                                      lessonForm.reset({
                                        title: lesson.title,
                                        content: lesson.content,
                                        verse: lesson.verse || '',
                                        videoUrl: lesson.videoUrl || ''
                                      });
                                      setIsAddLessonOpen(true);
                                    }}
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm("Supprimer cette leçon ?")) {
                                        deleteCourseLesson(lesson.id);
                                        toast.success("Leçon supprimée");
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover/item:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          ))}
                          <Button 
                            variant="ghost" 
                            className="w-full h-12 text-[10px] text-church-gold/60 hover:text-church-gold hover:bg-church-gold/5 border-t border-dashed rounded-none transition-all"
                            onClick={() => {
                              setEditingLessonId(null);
                              setSelectedModuleId(module.id);
                              lessonForm.reset({ title: '', content: '', verse: '', videoUrl: '' });
                              setIsAddLessonOpen(true);
                            }}
                          >
                            <Plus className="w-3 h-3 mr-2" />
                            Ajouter une leçon au module
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="participants" className="space-y-6 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Gestion des Présences</h3>
                <div className="flex gap-2">
                  <Select defaultValue="all-lessons">
                    <SelectTrigger className="h-8 text-xs w-48">
                      <SelectValue placeholder="Toutes les leçons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-lessons">Toutes les leçons</SelectItem>
                      {courseLessons.filter(l => modules.some(m => m.id === l.moduleId)).map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog>
                    <DialogTrigger render={<Button size="sm" className="bg-blue-600 text-white" />}>
                    <Users className="w-4 h-4 mr-2" /> Inscrire
                  </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Inscrire un membre</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input placeholder="Chercher un membre..." className="pl-9" />
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 px-1">
                          {members.filter(m => !enrollments.some(e => e.memberId === m.id)).map(m => (
                            <div key={m.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-church-gold/10 text-church-gold text-xs">{m.firstName[0]}{m.lastName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{m.firstName} {m.lastName}</p>
                                  <p className="text-[10px] text-slate-500">{m.groups.join(', ')}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleEnroll(m.id)}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Card className="border-none shadow-md">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Participant</TableHead>
                      {courseLessons.filter(l => modules.some(m => m.id === l.moduleId)).slice(0, 4).map(l => (
                        <TableHead key={l.id} className="text-center text-[10px] uppercase font-bold text-slate-400">{l.title.slice(0, 10)}...</TableHead>
                      ))}
                      <TableHead className="text-right">Progression</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map(enrollment => {
                      const member = members.find(m => m.id === enrollment.memberId);
                      if (!member) return null;
                      const lessons = courseLessons.filter(l => modules.some(m => m.id === l.moduleId)).slice(0, 4);
                      return (
                        <TableRow key={enrollment.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-7 h-7">
                                <AvatarFallback className="text-[10px]">{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-bold">{member.firstName} {member.lastName}</p>
                              </div>
                            </div>
                          </TableCell>
                          {lessons.map(l => {
                            const isPresent = enrollment.completedLessons.includes(l.id);
                            return (
                              <TableCell key={l.id} className="text-center">
                                <button 
                                  onClick={() => handleLessonCompletion(member.id, l.id, !isPresent)}
                                  className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                    isPresent ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                                  )}
                                >
                                  {isPresent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                </button>
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] font-bold">{enrollment.progress.toFixed(0)}%</span>
                              <Progress value={enrollment.progress} className="w-16 h-1" />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6 mt-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Analyse de la Cohorte</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={enrollments.map(e => {
                        const m = members.find(mem => mem.id === e.memberId);
                        return { name: m?.lastName || '?', progress: e.progress };
                      })}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip />
                        <Bar dataKey="progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>



            <TabsContent value="notes" className="space-y-6 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold font-serif">Gestion Académique</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => setIsAddSubjectOpen(true)}>
                    <Settings className="w-3 h-3 mr-2" />
                    Matières ({subjects.length})
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100"
                    onClick={() => setShowAttendance(true)}
                  >
                    <ClipboardList className="w-3 h-3 mr-2" />
                    Fiche de Présence
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100"
                    onClick={() => setShowGradesSheet(true)}
                  >
                    <FileText className="w-3 h-3 mr-2" />
                    Fiche de Notes
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-100"
                    onClick={() => setShowCertificates(true)}
                  >
                    <Award className="w-3 h-3 mr-2" />
                    Certificats
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {subjects.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-xl gap-2">
                    <BookMarked className="w-6 h-6 opacity-20" />
                    <p className="text-xs italic">Veuillez configurer au moins une matière pour attribuer des notes.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {enrollments.map(enrollment => {
                      const member = members.find(m => m.id === enrollment.memberId);
                      if (!member) return null;

                      const studentGrades = courseGrades.filter(g => g.enrollmentId === enrollment.id);
                      const average = studentGrades.length > 0
                        ? studentGrades.reduce((acc, g) => {
                            const subject = subjects.find(s => s.id === g.subjectId);
                            const coeff = subject?.coefficient || 1;
                            return acc + (g.value * coeff);
                          }, 0) / studentGrades.reduce((acc, g) => {
                            const subject = subjects.find(s => s.id === g.subjectId);
                            return acc + (subject?.coefficient || 1);
                          }, 0)
                        : 0;

                      return (
                        <Card key={enrollment.id} className="border-none shadow-sm overflow-hidden bg-white/50 hover:bg-white transition-colors border border-transparent hover:border-slate-100">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-[200px]">
                                <Avatar className="w-10 h-10 ring-2 ring-slate-100">
                                  <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                    {member.firstName[0]}{member.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-bold text-sm text-slate-900">{member.firstName} {member.lastName}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[9px] h-4 py-0">Moyenne: {average.toFixed(2)}/20</Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="flex-1 overflow-x-auto">
                                <div className="flex gap-4 pb-2 px-1">
                                  {subjects.map(subject => {
                                    const grade = studentGrades.find(g => g.subjectId === subject.id);
                                    return (
                                      <div key={subject.id} className="flex flex-col gap-1 min-w-[100px]">
                                        <span className="text-[10px] text-slate-400 font-medium truncate w-24" title={subject.name}>{subject.name}</span>
                                        <div className="flex items-center gap-1 group">
                                          <Input 
                                            type="number" 
                                            min="0" 
                                            max="20"
                                            step="0.25"
                                            value={grade?.value || ''}
                                            onChange={(e) => {
                                              const val = parseFloat(e.target.value);
                                              if (grade) {
                                                updateCourseGrade(grade.id, { value: val });
                                              } else {
                                                addCourseGrade({
                                                  enrollmentId: enrollment.id,
                                                  subjectId: subject.id,
                                                  value: val,
                                                  date: new Date().toISOString()
                                                });
                                              }
                                            }}
                                            className="h-8 text-xs font-bold w-16"
                                            placeholder="--/20"
                                          />
                                          {subject.coefficient && <span className="text-[9px] text-slate-300 font-bold">x{subject.coefficient}</span>}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => setSelectedEnrollmentForBulletin(enrollment.id)}
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Bulletin
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Supports de Cours</h3>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => setIsAddResourceOpen(true)}>
                  <BookMarked className="w-3 h-3 mr-2" />
                  Ajouter
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map(resource => (
                  <div key={resource.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        resource.type === 'pdf' ? "bg-rose-50 text-rose-600" : 
                        resource.type === 'video' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-600"
                      )}>
                        {resource.type === 'pdf' ? <FileText className="w-4 h-4" /> : 
                         resource.type === 'video' ? <FileVideo className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{resource.title}</p>
                        <p className="text-[10px] text-slate-400 uppercase">{resource.type}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => window.open(resource.url, '_blank')}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md bg-slate-900 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Parcours de Croissance
                </CardTitle>
                <div 
                  className={cn(
                    "w-8 h-4 rounded-full relative cursor-pointer transition-colors px-1 flex items-center",
                    isGPPEnabled ? "bg-emerald-500" : "bg-slate-700"
                  )}
                  onClick={() => setIsGPPToggleConfirmOpen(true)}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full bg-white transition-all transform",
                    isGPPEnabled ? "translate-x-4" : "translate-x-0"
                  )} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <p className="text-xs font-bold">📈 Analyse d'Engagement</p>
                <p className="text-[10px] text-slate-300 mt-1">
                  <strong>{enrollments.filter(e => e.progress > 80).length}</strong> membres sont très actifs. 
                  <strong>{enrollments.filter(e => e.progress < 20).length}</strong> membres semblent passifs.
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <p className="text-xs font-bold">🎓 Étape Suivante</p>
                <p className="text-[10px] text-slate-300 mt-1">Après cette formation, les membres seront prêts pour le niveau <strong>Intermédiaire</strong>.</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full bg-church-gold hover:bg-church-gold/90 text-slate-900 font-bold border-none text-xs h-9 shadow-lg shadow-church-gold/20"
              >
                Générer Rapport de Cohorte
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Formateur</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback>{instructor?.firstName[0]}{instructor?.lastName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-sm">{instructor?.firstName} {instructor?.lastName}</p>
                <p className="text-[10px] text-slate-500">Responsable de formation</p>
                <Button variant="link" className="h-auto p-0 text-[10px] text-blue-600">Contacter</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Statistiques Globales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Moyenne de progression</span>
                <span className="font-bold text-blue-600">{averageProgress.toFixed(0)}%</span>
              </div>
              <Progress value={averageProgress} className="h-1 bg-slate-100" />
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Taux de réussite (Quiz)</span>
                <span className="font-bold text-emerald-600">78%</span>
              </div>
              <Progress value={78} className="h-1 bg-slate-100" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lesson View Dialog */}
      <Dialog open={!!selectedLessonId} onOpenChange={(open) => !open && setSelectedLessonId(null)}>
        <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{selectedLesson?.title}</DialogTitle>
                <p className="text-xs text-slate-500 mt-1">{selectedLesson?.verse}</p>
              </div>
              <Badge variant="outline">Leçon {selectedLesson?.order}</Badge>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed">{selectedLesson?.content}</p>
            </div>
            
            {selectedLesson?.videoUrl && (
              <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-white/50" />
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Exercice de réflexion
              </h4>
              <p className="text-xs text-blue-700">Comment ce verset s'applique-t-il à votre vie quotidienne ? Prenez 5 minutes pour méditer.</p>
            </div>
          </div>
          <DialogFooter className="p-6 border-t bg-slate-50">
            <div className="flex justify-between w-full items-center">
              <Button variant="ghost" size="sm" className="text-xs">Précédent</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Marquer comme terminée
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">Suivant</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Module Dialog */}
      <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layout className="w-5 h-5 text-church-gold" />
              {editingModuleId ? "Modifier le Module" : "Nouveau Module Pédagogique"}
            </DialogTitle>
          </DialogHeader>
          <Form {...moduleForm}>
            <form onSubmit={moduleForm.handleSubmit(onAddModule)} className="space-y-4 py-4">
              <FormField
                control={moduleForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du module</FormLabel>
                    <FormControl><Input placeholder="Ex: Fondements Théologiques" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-church-gold text-white">
                {editingModuleId ? "Mettre à jour" : "Créer le module"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* New Lesson Dialog */}
      <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-blue-600" />
              {editingLessonId ? "Modifier la leçon" : "Ajouter une nouvelle leçon"}
            </DialogTitle>
          </DialogHeader>
          <Form {...lessonForm}>
            <form onSubmit={lessonForm.handleSubmit(onAddLesson)} className="space-y-4 py-4">
              <FormField
                control={lessonForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre de la leçon</FormLabel>
                    <FormControl><Input placeholder="Ex: La Grâce de Dieu" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={lessonForm.control}
                name="verse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verset de base (Optionnel)</FormLabel>
                    <FormControl><Input placeholder="Ex: Jean 3:16" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={lessonForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu / Notes de cours</FormLabel>
                    <FormControl><Input placeholder="Détails de la leçon..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={lessonForm.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lien Vidéo (Optionnel)</FormLabel>
                    <FormControl><Input placeholder="URL Youtube ou Vimeo" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-blue-600 text-white">
                {editingLessonId ? "Mettre à jour la leçon" : "Enregistrer la leçon"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Resource Dialog */}
      <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-blue-500" />
              Supports & Ressources
            </DialogTitle>
          </DialogHeader>
          <Form {...resourceForm}>
            <form onSubmit={resourceForm.handleSubmit(onAddResource)} className="space-y-4 py-4">
              <FormField
                control={resourceForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du support</FormLabel>
                    <FormControl><Input placeholder="Ex: Manuel de l'élève" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resourceForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de fichier</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="pdf">Document PDF</SelectItem>
                        <SelectItem value="video">Support Vidéo</SelectItem>
                        <SelectItem value="doc">Document Word / Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div 
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 transition-all cursor-pointer",
                  selectedFile ? "border-church-green bg-emerald-50" : "border-slate-200 hover:border-church-gold/50"
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
                    setSelectedFile(file);
                    if (!resourceForm.getValues('title')) {
                      resourceForm.setValue('title', file.name.split('.')[0]);
                    }
                  }
                }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileSelect}
                  accept={
                    resourceForm.watch('type') === 'pdf' ? '.pdf' : 
                    resourceForm.watch('type') === 'video' ? 'video/*' : '*'
                  }
                />
                {selectedFile ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="text-sm font-medium text-emerald-800">{selectedFile.name}</p>
                    <p className="text-[10px] text-emerald-600">Fichier prêt à être téléversé</p>
                    <Button variant="link" className="text-xs text-rose-600 mt-2 h-auto p-0" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}>Changer de fichier</Button>
                  </>
                ) : (
                  <>
                    <FileDown className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs text-slate-500">Glissez-déposez vos fichiers ici</p>
                    <Button 
                      type="button"
                      variant="link" 
                      className="text-xs text-blue-600 mt-2 h-auto p-0"
                    >
                      Ou parcourir vos dossiers
                    </Button>
                  </>
                )}
              </div>
              <Button type="submit" className="w-full bg-blue-600 text-white">Téléverser et Ajouter</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>



      {/* Add Subject Dialog */}
      <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-church-gold" />
              Configuration des Matières
            </DialogTitle>
            <DialogDescription>
              Ajoutez les matières qui seront évaluées dans cette formation. Les coefficients sont optionnels.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Form {...subjectForm}>
              <form onSubmit={subjectForm.handleSubmit(onAddSubject)} className="flex items-start gap-4">
                <FormField
                  control={subjectForm.control as any}
                  name="name"
                  render={({ field }) => (
                    <div className="flex-1 space-y-1">
                      <FormLabel className="text-xs">Nom de la matière</FormLabel>
                      <FormControl><Input placeholder="Ex: Dogmatique Christianne" {...field} className="h-9 text-xs" /></FormControl>
                    </div>
                  )}
                />
                <FormField
                  control={subjectForm.control as any}
                  name="coefficient"
                  render={({ field }) => (
                    <div className="w-24 space-y-1">
                      <FormLabel className="text-xs">Coeff.</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          className="h-9 text-xs" 
                        />
                      </FormControl>
                    </div>
                  )}
                />
                <Button type="submit" className="mt-6 h-9 bg-church-gold text-white">Ajouter</Button>
              </form>
            </Form>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matières configurées</h4>
              <div className="divide-y divide-slate-100 border rounded-lg bg-slate-50/50">
                {subjects.length === 0 ? (
                  <p className="p-4 text-xs text-center text-slate-400 italic">Aucune matière configurée</p>
                ) : (
                  subjects.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{s.name}</p>
                        <p className="text-[10px] text-slate-400">Coefficient: {s.coefficient || 1}</p>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => deleteCourseSubject(s.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulletin A4 Dialog */}
      <Dialog open={!!selectedEnrollmentForBulletin} onOpenChange={(open) => !open && setSelectedEnrollmentForBulletin(null)}>
        <DialogContent className="sm:max-w-[900px] h-[95vh] flex flex-col p-0 overflow-hidden bg-slate-100">
          <DialogHeader className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-church-gold" />
                Aperçu du Bulletin de Notes
              </DialogTitle>
              <Button size="sm" className="bg-slate-900 text-white" onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-2" />
                Imprimer (PDF)
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-8 print:p-0 bg-slate-200 flex justify-center">
            {/* A4 Paper Component */}
            <div className="w-[21cm] min-h-[29.7cm] bg-white shadow-2xl p-[2cm] print:shadow-none print:w-full print:p-0 flex flex-col gap-12 font-serif text-slate-900">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-8">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold uppercase tracking-widest text-church-gold leading-none">ÉGLISE EKKLESIA</h1>
                  <p className="text-xs font-bold leading-none">DÉPARTEMENT DE FORMATION & CROISSANCE</p>
                  <div className="pt-4 text-[10px] space-y-0.5 font-sans">
                    <p>Adresse: 123 Avenue de la Foi</p>
                    <p>Contact: formations@ekklesia.org</p>
                    <p>Site: www.ekklesia-app.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-slate-200 mb-2">
                    <GraduationCap className="w-12 h-12 text-slate-300" />
                  </div>
                  <p className="text-[10px] font-bold uppercase underline">Année Académique 2025-2026</p>
                </div>
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                  <h2 className="text-lg font-bold border-b border-slate-200 pb-1">IDENTITÉ DE L'APPRENANT</h2>
                  {(() => {
                    const enrollment = enrollments.find(e => e.id === selectedEnrollmentForBulletin);
                    const member = members.find(m => m.id === enrollment?.memberId);
                    return (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-bold opacity-60">Nom & Prénoms :</span> <span className="uppercase font-bold">{member?.lastName}</span> {member?.firstName}</p>
                        <p><span className="font-bold opacity-60">ID Étudiant :</span> <span className="font-mono">{member?.id.slice(0, 8)}</span></p>
                        <p><span className="font-bold opacity-60">Formation :</span> {course.title}</p>
                        <p><span className="font-bold opacity-60">Niveau :</span> <span className="capitalize">{course.level}</span></p>
                      </div>
                    );
                  })()}
                </div>
                <div className="space-y-4">
                  <h2 className="text-lg font-bold border-b border-slate-200 pb-1">RÉSUMÉ DES RÉSULTATS</h2>
                  {(() => {
                    const enrollment = enrollments.find(e => e.id === selectedEnrollmentForBulletin);
                    const studentGrades = courseGrades.filter(g => g.enrollmentId === enrollment?.id);
                    const totalCoeff = studentGrades.reduce((acc, g) => {
                      const s = subjects.find(sub => sub.id === g.subjectId);
                      return acc + (s?.coefficient || 1);
                    }, 0);
                    const totalPoints = studentGrades.reduce((acc, g) => {
                      const s = subjects.find(sub => sub.id === g.subjectId);
                      return acc + (g.value * (s?.coefficient || 1));
                    }, 0);
                    const avg = totalCoeff > 0 ? totalPoints / totalCoeff : 0;
                    
                    return (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-bold opacity-60">Total Points :</span> {totalPoints.toFixed(2)} / {(totalCoeff * 20).toFixed(0)}</p>
                        <p className="text-xl font-bold"><span className="opacity-60 text-sm">Moyenne Générale :</span> {avg.toFixed(2)}/20</p>
                        <p><span className="font-bold opacity-60">Décision :</span> <span className={cn("font-bold px-2 py-0.5 rounded", avg >= 10 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>{avg >= 10 ? "ADMIS(E)" : "AJOURNÉ(E)"}</span></p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Grades Table */}
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-4 uppercase tracking-wider">Détail des Évaluations</h2>
                <table className="w-full border-collapse border-2 border-slate-900">
                  <thead>
                    <tr className="bg-slate-900 text-white leading-none">
                      <th className="border border-white p-2 text-left text-[11px] uppercase tracking-wider">Matières / Unités d'Enseignement</th>
                      <th className="border border-white p-2 text-center text-[11px] uppercase tracking-wider w-20">Coeff.</th>
                      <th className="border border-white p-2 text-center text-[11px] uppercase tracking-wider w-24">Note / 20</th>
                      <th className="border border-white p-2 text-center text-[11px] uppercase tracking-wider w-32">Appréciations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(subject => {
                      const enrollment = enrollments.find(e => e.id === selectedEnrollmentForBulletin);
                      const grade = courseGrades.find(g => g.enrollmentId === enrollment?.id && g.subjectId === subject.id);
                      return (
                        <tr key={subject.id}>
                          <td className="border border-slate-900 p-3 text-sm font-bold">{subject.name}</td>
                          <td className="border border-slate-900 p-3 text-center text-sm">{subject.coefficient || 1}</td>
                          <td className="border border-slate-900 p-3 text-center text-sm font-mono font-bold">{grade?.value ? grade.value.toFixed(2) : "--"}</td>
                          <td className="border border-slate-900 p-3 text-center text-[10px] italic">
                            {grade?.value ? (
                              grade.value >= 16 ? "Excellent" :
                              grade.value >= 14 ? "Très Bien" :
                              grade.value >= 12 ? "Assez Bien" :
                              grade.value >= 10 ? "Passable" : "Insuffisant"
                            ) : "Non évalué"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer / Signatures */}
              <div className="mt-auto grid grid-cols-2 gap-24 pt-12 text-sm">
                <div className="text-center space-y-16">
                  <p className="font-bold uppercase underline">Le Formateur</p>
                  <div className="space-y-1">
                    <p className="text-xs italic">Signature & Cachet</p>
                    <p className="font-bold">{instructor?.firstName} {instructor?.lastName}</p>
                  </div>
                </div>
                <div className="text-center space-y-16">
                  <p className="font-bold uppercase underline">La Direction</p>
                  <div className="space-y-1">
                    <p className="text-xs italic">Fait à Kinshasa, le {format(new Date(), 'dd/MM/yyyy')}</p>
                    <p className="font-bold">Secrétariat Académique</p>
                  </div>
                </div>
              </div>

              {/* Security info */}
              <div className="text-[8px] text-slate-400 font-sans flex justify-between border-t border-slate-100 pt-2">
                <p>Document authentifié par système ID: {crypto.randomUUID().slice(0, 8)}</p>
                <p>Page 1 sur 1</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* GPP Confirm Dialog */}
      <Dialog open={isGPPToggleConfirmOpen} onOpenChange={setIsGPPToggleConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              Avertissement de Sécurité
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Êtes-vous sûr de vouloir {isGPPEnabled ? "désactiver" : "activer"} l'IA de <strong>Parcours de Croissance</strong> ?
            </p>
            <p className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-lg">
              {isGPPEnabled 
                ? "La désactivation arrêtera l'analyse en temps réel des performances et les recommandations automatiques pour les membres."
                : "L'activation permettra au système d'analyser les données anonymisées pour suggérer des étapes de croissance personnalisées."}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsGPPToggleConfirmOpen(false)}>Annuler</Button>
            <Button 
              className={isGPPEnabled ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
              onClick={() => {
                setIsGPPEnabled(!isGPPEnabled);
                setIsGPPToggleConfirmOpen(false);
                toast.success(isGPPEnabled ? "Parcours IA désactivé" : "Parcours IA activé");
              }}
            >
              Confirmer {isGPPEnabled ? "la désactivation" : "l'activation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AttendanceSheetView({ 
  course, 
  enrollments, 
  members,
  onBack
}: { 
  course: Course; 
  enrollments: CourseEnrollment[]; 
  members: Member[]; 
  onBack: () => void;
}) {
  return (
    <div className="min-h-[90vh] flex flex-col bg-slate-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="p-4 border-b bg-white no-print flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-church-gold" />
            <h2 className="font-bold text-slate-900">Fiche de Présence de Classe</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs" onClick={onBack}>
            Fermer
          </Button>
          <Button size="sm" className="bg-slate-900 text-white" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimer la Fiche
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-200 custom-scrollbar">
        {/* A4 Paper */}
        <div className="w-[21cm] min-h-[29.7cm] bg-white shadow-2xl p-[1.5cm] print:shadow-none print:w-full print:p-0 flex flex-col gap-8 font-serif text-slate-900 print-container">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black uppercase text-church-gold">ÉGLISE EKKLESIA</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Département de Formation & Croissance</p>
              <div className="pt-2 text-[9px] font-sans space-y-0.5">
                <p>FICHE DE PRÉSENCE JOURNALIÈRE</p>
                <p>Formation: <span className="font-bold">{course.title}</span></p>
                <p>Niveau: <span className="uppercase">{course.level}</span></p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 mb-2">
                 <ClipboardList className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-[9px] font-bold">DATE: ____ / ____ / 20____</p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="flex-1">
            <table className="w-full border-collapse border border-slate-900">
              <thead>
                <tr className="bg-slate-900 text-white leading-none">
                  <th className="border border-slate-900 p-2 text-center text-[10px] w-10">#</th>
                  <th className="border border-slate-900 p-2 text-left text-[10px] uppercase tracking-wider">Nom & Prénoms de l'Apprenant</th>
                  <th className="border border-slate-900 p-2 text-center text-[10px] uppercase tracking-wider w-24">Présence</th>
                  <th className="border border-slate-900 p-2 text-center text-[10px] uppercase tracking-wider w-24">Retard</th>
                  <th className="border border-slate-900 p-2 text-center text-[10px] uppercase tracking-wider w-32">Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {enrollments.map((enrollment, idx) => {
                  const member = members.find(m => m.id === enrollment.memberId);
                  return (
                    <tr key={enrollment.id} className="h-10">
                      <td className="border border-slate-300 p-2 text-center text-xs text-slate-400">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 text-sm font-bold uppercase">
                        {member?.lastName} {member?.firstName}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        <div className="w-4 h-4 border border-slate-400 mx-auto rounded-sm" />
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                         <div className="w-4 h-4 border border-slate-400 mx-auto rounded-sm" />
                      </td>
                      <td className="border border-slate-300 p-2"></td>
                    </tr>
                  );
                })}
                {/* Empty rows if needed */}
                {Array.from({ length: Math.max(0, 15 - enrollments.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="h-10 opacity-20">
                    <td className="border border-slate-300 p-2 text-center text-xs">{enrollments.length + i + 1}</td>
                    <td className="border border-slate-300 p-2"></td>
                    <td className="border border-slate-300 p-2"></td>
                    <td className="border border-slate-300 p-2"></td>
                    <td className="border border-slate-300 p-2"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-between items-end border-t border-slate-100 pt-6">
            <div className="text-center space-y-12">
               <p className="text-[10px] font-bold uppercase underline">Visa du Formateur</p>
               <div className="h-0.5 w-32 bg-slate-200 mx-auto" />
            </div>
            <div className="text-[8px] text-slate-400 font-sans italic">
               Généré via Système Ekklesia - {format(new Date(), 'dd/MM/yyyy HH:mm')}
            </div>
            <div className="text-center space-y-12">
               <p className="text-[10px] font-bold uppercase underline">Visa de la Scolarité</p>
               <div className="h-0.5 w-32 bg-slate-200 mx-auto" />
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
        }
      `}} />
    </div>
  );
}

function GradesSheetView({ 
  course, 
  enrollments, 
  members,
  subjects,
  courseGrades,
  onBack
}: { 
  course: Course; 
  enrollments: CourseEnrollment[]; 
  members: Member[]; 
  subjects: any[];
  courseGrades: any[];
  onBack: () => void;
}) {
  return (
    <div className="min-h-[90vh] flex flex-col bg-slate-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="p-4 border-b bg-white no-print flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-church-gold" />
            <h2 className="font-bold text-slate-900">Fiche Globale des Notes</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs" onClick={onBack}>
            Fermer
          </Button>
          <Button size="sm" className="bg-slate-900 text-white" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimer la Fiche
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-200 custom-scrollbar">
        {/* A4 Paper */}
        <div className="w-[29.7cm] min-h-[21cm] bg-white shadow-2xl p-[1.5cm] print:shadow-none print:w-full print:p-0 flex flex-col gap-8 font-serif text-slate-900 print-container">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black uppercase text-church-gold">ÉGLISE EKKLESIA</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Département de Formation & Croissance</p>
              <div className="pt-2 text-[9px] font-sans space-y-0.5">
                <p>FICHE RÉCAPITULATIVE DES NOTES</p>
                <p>Formation: <span className="font-bold">{course.title}</span></p>
                <p>Niveau: <span className="uppercase">{course.level}</span></p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 mb-2">
                 <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-[9px] font-bold">Session: {new Date().getFullYear()}</p>
            </div>
          </div>

          {/* Grades Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse border border-slate-900">
              <thead>
                <tr className="bg-slate-900 text-white leading-none">
                  <th className="border border-slate-900 p-2 text-center text-[10px] w-10">#</th>
                  <th className="border border-slate-900 p-2 text-left text-[10px] uppercase tracking-wider min-w-[200px]">Apprenants</th>
                  {subjects.map(subject => (
                    <th key={subject.id} className="border border-slate-900 p-2 text-center text-[9px] uppercase tracking-wider min-w-[60px]">
                      {subject.name}<br/>
                      <span className="text-[8px] opacity-70">Coeff: {subject.coefficient || 1}</span>
                    </th>
                  ))}
                  <th className="border border-slate-900 p-2 text-center text-[10px] uppercase tracking-wider w-24 bg-church-gold">Moyenne</th>
                  <th className="border border-slate-900 p-2 text-center text-[10px] uppercase tracking-wider w-32">Décision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {enrollments.map((enrollment, idx) => {
                  const member = members.find(m => m.id === enrollment.memberId);
                  const studentGrades = courseGrades.filter(g => g.enrollmentId === enrollment.id);
                  
                  const totalCoeff = studentGrades.reduce((acc, g) => {
                    const s = subjects.find(sub => sub.id === g.subjectId);
                    return acc + (s?.coefficient || 1);
                  }, 0);
                  const totalPoints = studentGrades.reduce((acc, g) => {
                    const s = subjects.find(sub => sub.id === g.subjectId);
                    return acc + (g.value * (s?.coefficient || 1));
                  }, 0);
                  const avg = totalCoeff > 0 ? totalPoints / totalCoeff : 0;

                  return (
                    <tr key={enrollment.id} className="h-10">
                      <td className="border border-slate-300 p-2 text-center text-xs text-slate-400">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 text-sm font-bold uppercase">
                        {member?.lastName} {member?.firstName}
                      </td>
                      {subjects.map(subject => {
                        const grade = studentGrades.find(g => g.subjectId === subject.id);
                        return (
                          <td key={subject.id} className="border border-slate-300 p-2 text-center text-sm font-mono">
                            {grade?.value ? grade.value.toFixed(2) : "--"}
                          </td>
                        );
                      })}
                      <td className="border border-slate-900 p-2 text-center text-sm font-bold bg-slate-50">
                        {avg.toFixed(2)}
                      </td>
                      <td className="border border-slate-300 p-2 text-center text-[10px] font-bold">
                        {avg >= 10 ? (
                          <span className="text-emerald-600">ADMIS(E)</span>
                        ) : avg > 0 ? (
                          <span className="text-rose-600">AJOURNÉ(E)</span>
                        ) : "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-between items-end border-t border-slate-100 pt-6">
            <div className="text-center space-y-12">
               <p className="text-[10px] font-bold uppercase underline">Signature du Formateur</p>
               <div className="h-0.5 w-32 bg-slate-200 mx-auto" />
            </div>
            <div className="text-[8px] text-slate-400 font-sans italic">
               Généré via Système Ekklesia - {format(new Date(), 'dd/MM/yyyy HH:mm')}
            </div>
            <div className="text-center space-y-12">
               <p className="text-[10px] font-bold uppercase underline">Visa du Secrétariat</p>
               <div className="h-0.5 w-32 bg-slate-200 mx-auto" />
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
        }
      `}} />
    </div>
  );
}

function CertificatesView({ 
  course, 
  enrollments, 
  members,
  subjects,
  courseGrades,
  onBack
}: { 
  course: Course; 
  enrollments: CourseEnrollment[]; 
  members: Member[]; 
  subjects: any[];
  courseGrades: any[];
  onBack: () => void;
}) {
  const passingEnrollments = enrollments.filter(enrollment => {
    const studentGrades = courseGrades.filter(g => g.enrollmentId === enrollment.id);
    const totalCoeff = studentGrades.reduce((acc, g) => {
      const s = subjects.find(sub => sub.id === g.subjectId);
      return acc + (s?.coefficient || 1);
    }, 0);
    const totalPoints = studentGrades.reduce((acc, g) => {
      const s = subjects.find(sub => sub.id === g.subjectId);
      return acc + (g.value * (s?.coefficient || 1));
    }, 0);
    const avg = totalCoeff > 0 ? totalPoints / totalCoeff : 0;
    return avg >= 10;
  });

  return (
    <div className="min-h-[90vh] flex flex-col bg-slate-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="p-4 border-b bg-white no-print flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-church-gold" />
            <h2 className="font-bold text-slate-900">Génération des Certificats</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs" onClick={onBack}>
            Fermer
          </Button>
          <Button size="sm" className="bg-church-gold text-white" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimer Tout ({passingEnrollments.length})
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-12 bg-slate-200 custom-scrollbar">
        {passingEnrollments.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center space-y-4 shadow-sm border border-slate-200">
            <Award className="w-12 h-12 text-slate-200 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">Aucun Certificat Éligible</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Les certificats sont générés pour les participants ayant une moyenne générale supérieure ou égale à 10/20.
            </p>
          </div>
        ) : (
          passingEnrollments.map((enrollment, idx) => {
            const member = members.find(m => m.id === enrollment.memberId);
            return (
              <div key={enrollment.id} className="certificate-page bg-white shadow-2xl mx-auto relative overflow-hidden" 
                   style={{ width: '29.7cm', height: '21cm', padding: '1.5cm' }}>
                
                {/* Decorative border */}
                <div className="absolute inset-4 border-8 border-double border-church-gold/30 rounded-sm pointer-events-none" />
                <div className="absolute inset-8 border border-church-gold/20 rounded-sm pointer-events-none" />
                
                {/* Content */}
                <div className="h-full border-4 border-church-gold/10 p-8 flex flex-col items-center justify-between text-center relative z-10">
                  
                  {/* Logo/Header */}
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-church-gold/5 rounded-full flex items-center justify-center mx-auto border-2 border-church-gold/20 mb-2">
                      <GraduationCap className="w-10 h-10 text-church-gold" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tighter text-church-gold uppercase">ÉGLISE EKKLESIA</h2>
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Département de Formation & Croissance</p>
                    </div>
                  </div>

                  {/* Certificate Title */}
                  <div className="py-8">
                    <h1 className="text-6xl font-serif font-black italic text-slate-900 mb-2">Attestation de Succès</h1>
                    <div className="h-1 w-48 bg-church-gold mx-auto rounded-full" />
                  </div>

                  {/* Recipient info */}
                  <div className="space-y-6">
                    <p className="text-xl font-serif text-slate-500">Ce certificat est fièrement décerné à :</p>
                    <h3 className="text-5xl font-black text-slate-900 uppercase border-b-2 border-slate-100 pb-2 inline-block px-12">
                      {member?.lastName} {member?.firstName}
                    </h3>
                    <p className="text-lg font-serif text-slate-600 max-w-2xl mx-auto leading-relaxed">
                      Pour avoir complété avec succès et brio la formation de :
                    </p>
                    <p className="text-2xl font-bold text-church-gold uppercase tracking-wide">
                      {course.title}
                    </p>
                    <p className="text-sm font-medium text-slate-400">
                      Niveau {course.level.toUpperCase()} • Session {new Date().getFullYear()}
                    </p>
                  </div>

                  {/* Signatures */}
                  <div className="w-full flex justify-between items-end px-12 pt-12">
                    <div className="text-center space-y-2">
                      <div className="w-48 h-px bg-slate-200" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Le Formateur Responsable</p>
                    </div>
                    
                    <div className="mb-[-10px]">
                      <div className="w-16 h-16 border-2 border-church-gold/30 rounded-full flex items-center justify-center rotate-12">
                        <Award className="w-8 h-8 text-church-gold/40" />
                      </div>
                    </div>

                    <div className="text-center space-y-2">
                      <div className="w-48 h-px bg-slate-200" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">La Direction de la Scolarité</p>
                    </div>
                  </div>

                  {/* Footer info */}
                  <div className="text-[8px] text-slate-300 font-sans tracking-widest uppercase">
                    ID: {enrollment.id.slice(0,8).toUpperCase()} • {format(new Date(), 'MMMM yyyy', { locale: fr })}
                  </div>
                </div>

                {/* Decoration corners */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-church-gold/5 rounded-br-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-church-gold/5 rounded-tl-full translate-x-1/2 translate-y-1/2" />
              </div>
            );
          })
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          .certificate-page, .certificate-page * { visibility: visible; }
          .certificate-page { 
            position: relative;
            display: block;
            margin: 0 !important;
            padding: 1.5cm !important;
            box-shadow: none !important;
            page-break-after: always;
            width: 29.7cm !important;
            height: 21cm !important;
          }
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
}

export function TrainingManagement() {
  const { courses, courseEnrollments, members, churches, addCourse } = useStore();
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      level: 'beginner',
      instructorId: '',
      duration: '4 semaines',
      churchId: churches[0]?.id || '1',
    },
  });

  const onSubmit = (values: CourseFormValues) => {
    addCourse({
      ...values,
      status: 'planned',
      objectives: [],
    });
    setIsAddDialogOpen(false);
    form.reset();
    toast.success("Formation créée avec succès");
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  if (selectedCourse) {
    return <CourseDetail course={selectedCourse} onClose={() => setSelectedCourseId(null)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Formations & Croissance</h1>
          <p className="text-slate-500">Équipez les saints pour l'œuvre du ministère.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={<Button className="bg-church-gold hover:bg-church-gold/90 text-white shadow-lg shadow-church-gold/20" />}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Formation
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader><DialogTitle>Créer un nouveau parcours</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control as any}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre de la Formation</FormLabel>
                      <FormControl><Input placeholder="Ex: Fondements de la Foi" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Débutant</SelectItem>
                            <SelectItem value="intermediate">Intermédiaire</SelectItem>
                            <SelectItem value="advanced">Avancé</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée estimée</FormLabel>
                        <FormControl><Input placeholder="Ex: 4 semaines" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control as any}
                  name="instructorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formateur Responsable</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description & Objectifs</FormLabel>
                      <FormControl>
                        <Input placeholder="Décrivez le contenu pédagogique..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="w-full bg-church-gold text-white">Lancer la Formation</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500">Formations Actives</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{courses.filter(c => c.status === 'ongoing').length}</h3>
            <p className="text-xs text-slate-400 mt-1">Parcours en cours</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500">Total Participants</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{courseEnrollments.length}</h3>
            <p className="text-xs text-emerald-600 mt-1 font-medium">Membres en formation</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500">Certifiés</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{courseEnrollments.filter(e => e.status === 'completed').length}</h3>
            <p className="text-xs text-slate-400 mt-1">Parcours terminés</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-slate-900">Nos Parcours</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full h-32 flex items-center justify-center text-slate-400 italic border-2 border-dashed rounded-xl">
              Aucune formation disponible pour le moment.
            </div>
          ) : (
            courses.slice().reverse().map((course) => {
              const enrollments = courseEnrollments.filter(e => e.courseId === course.id);
              const progress = enrollments.length > 0 
                ? enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length 
                : 0;
              return (
                <Card 
                  key={course.id} 
                  className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                  onClick={() => setSelectedCourseId(course.id)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={course.imageUrl || `https://picsum.photos/seed/${course.id}/800/600`} 
                      alt={course.title} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={cn(
                        "text-[10px]",
                        course.status === 'ongoing' ? "bg-emerald-500" : 
                        course.status === 'completed' ? "bg-slate-500" : "bg-blue-500"
                      )}>
                        {course.status === 'ongoing' ? 'En cours' : course.status === 'completed' ? 'Terminé' : 'À venir'}
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="text-[9px] bg-white/90 backdrop-blur-sm capitalize">{course.level}</Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="text-[10px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Durée: {course.duration}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Progression moyenne</span>
                        <span className="font-bold text-slate-900">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5 bg-slate-100" />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Users className="w-3 h-3" />
                        {enrollments.length} participants
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs group-hover:text-church-gold">
                        Accéder
                        <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Growth Path Feature */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-church-gold to-amber-600 text-white overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                <Trophy className="w-3 h-3" />
                Université Ekklesia
              </div>
              <h2 className="text-2xl font-serif font-bold">Parcours de Croissance Spirituelle</h2>
              <p className="text-white/80 text-sm max-w-md">
                Un cheminement structuré du nouveau croyant au leader affermi. Suivez votre progression et obtenez vos certificats.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Button className="bg-white text-church-gold hover:bg-white/90 text-xs">
                  Voir mon parcours
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-xs">
                  Catalogue complet
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((level) => (
                <div key={level} className={cn(
                  "w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 transition-all",
                  level === 1 ? "bg-white/20 border-white/40 scale-110" : "bg-white/5 border-white/10 opacity-50"
                )}>
                  <span className="text-[10px] uppercase font-bold">Niv</span>
                  <span className="text-xl font-bold">{level}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


