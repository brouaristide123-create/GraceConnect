import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChurchOfficial {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  department?: string;
  gender: 'M' | 'F';
}

export interface ChurchStats {
  adults: { m: number; f: number };
  children: { m: number; f: number };
}

export interface Church {
  id: string;
  name: string;
  code?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  description: string;
  pastor: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  type?: 'central' | 'branch';
  logoUrl?: string;
  officials?: ChurchOfficial[];
  stats?: ChurchStats;
  publishedContributions?: {
    id: string;
    title: string;
    description: string;
    amount?: number;
    deadline?: string;
    type: 'funeral' | 'special' | 'recurring';
    deceasedDetails?: {
      name: string;
      photoUrl: string;
      familyMemberName: string;
      relationship: string;
    };
  }[];
  publishedProjects?: {
    id: string;
    title: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    imageUrl?: string;
  }[];
  publishedTrainings?: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    instructor: string;
    imageUrl?: string;
  }[];
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  matricule?: string;
  email: string;
  phone: string;
  churchId: string;
  groups: string[];
  status: 'new' | 'active' | 'inactive' | 'archived' | 'suspended' | 'deceased';
  archivedAt?: string;
  archiveReason?: 'departure' | 'transfer' | 'inactivity' | 'death' | 'other';
  archiveNotes?: string;
  joinedAt: string;
  gender: 'M' | 'F';
  photoUrl?: string;
  address?: string;
  phone2?: string;
  city?: string;
  neighborhood?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  spouseName?: string;
  childrenCount?: number;
  childrenDetails?: string;
  profession?: string;
  workplace?: string;
  educationLevel?: string;
  birthDate?: string;
  conversionDate?: string;
  isBaptized: boolean;
  baptismDate?: string;
  baptismPlace?: string;
  formerChurch?: string;
  referredBy?: 'invitation' | 'social_media' | 'family' | 'other';
  departmentId?: string;
  role?: string;
  engagementLevel: 'new' | 'active' | 'leader';
  frequency?: 'regular' | 'occasional';
  healthIssues?: string;
  specialNeeds?: string;
  spiritualGoals?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  pastoralFollowupNeeded?: boolean;
  prayerNeeds?: string;
  leaderNotes?: string;
  idCardUrl?: string;
  baptismCertificateUrl?: string;
  otherDocs?: { name: string, url: string }[];
}

export interface PastoralNote {
  id: string;
  memberId: string;
  date: string;
  authorId: string;
  content: string;
  isPrivate: boolean;
  category: 'prayer' | 'counseling' | 'visit';
}

export interface Training {
  id: string;
  memberId: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: 'completed' | 'in_progress' | 'planned';
  certificateUrl?: string;
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  matricule?: string;
  birthDate: string;
  gender: 'M' | 'F';
  photoUrl?: string;
  
  // Parents
  parentId?: string;
  fatherName?: string;
  motherName?: string;
  mainPhone: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;

  // Security & Pickup
  authorizedPickups: { 
    name: string; 
    phone: string; 
    relation: string;
    photoUrl?: string;
  }[];
  
  // Education
  churchId: string;
  ageGroup: '0-5' | '6-10' | '11-15';
  classId?: string;
  teacherName?: string;

  // Spiritual
  isNewAtChurch: boolean;
  joinedAt: string;
  participation: 'regular' | 'occasional';

  // Medical
  allergies?: string;
  diseases?: string;
  currentTreatment?: string;
  specialNeeds?: string;

  // Emergency
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;

  // History & Tracking
  status: 'active' | 'inactive';
  notes?: string;
  points: number;
  badges: string[];

  // Documents
  medicalCertificateUrl?: string;
  parentalAuthorizationUrl?: string;

  // Security features
  securitySettings?: {
    useQRCode: boolean;
    parentChildCode: string;
  };

  // General settings
  settings: {
    allowPhotosVideos: boolean;
    receiveNotifications: boolean;
  };
}

export interface ChildCheckIn {
  id: string;
  childId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  checkedInBy: string;
  checkedOutBy?: string;
  status: 'present' | 'absent' | 'checked_out';
}

export interface ChildClass {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  teacherId: string;
  room: string;
  churchId: string;
}

export interface ChildLesson {
  id: string;
  classId: string;
  date: string;
  theme: string;
  verse: string;
  content: string;
  mediaUrls: string[];
}

export interface ChildReport {
  id: string;
  childId: string;
  month: string;
  participation: number;
  behavior: number;
  progress: string;
  notes: string;
}

export interface ContributionType {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'one-time' | 'weekly' | 'annual';
  deadline?: string;
  churchId: string;
}

export interface ContributionPayment {
  id: string;
  memberId: string;
  typeId: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Mobile Money' | 'Bank';
  status: 'paid' | 'pending' | 'overdue';
  notes?: string;
}

export interface ContributionGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  churchId: string;
}

export interface FuneralProgram {
  wakeDate?: string;
  wakeLocation?: string;
  wakeDescription?: string;
  ceremonyDate?: string;
  ceremonyTime?: string;
  ceremonyLocation?: string;
  burialLocation?: string;
  additionalNotes?: string;
}

export interface FuneralMilestone {
  id: string;
  label: string;
  date: string;
  isCompleted: boolean;
}

export interface FuneralCase {
  id: string;
  deceasedName: string;
  photoUrl?: string; // Legacy
  photos?: string[]; // Array of up to 5 photos
  isPublic?: boolean;
  memberId?: string; // If deceased was a member
  familyContactId: string; // Member ID of the main contact
  dateOfDeath: string;
  location: string;
  description: string;
  status: 'active' | 'active' | 'closed'; // Added twice to match potential union types in app
  createdAt: string;
  churchId: string;
  program?: FuneralProgram;
  milestones?: FuneralMilestone[];
}

export interface FuneralContribution {
  id: string;
  caseId: string;
  contributorName: string;
  memberId?: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Orange Money' | 'MTN MoMo' | 'Moov Money' | 'Wave' | 'Djamo' | 'Bank';
}

export interface FuneralExpense {
  id: string;
  caseId: string;
  category: 'transport' | 'organization' | 'family_aid' | 'other';
  description: string;
  amount: number;
  date: string;
  receiptUrl?: string;
}

export interface FuneralTask {
  id: string;
  caseId: string;
  title: string;
  assignedTo: string; // Member ID
  dueDate: string;
  status: 'pending' | 'completed';
  type: 'visit' | 'logistics' | 'ceremony' | 'other';
}

export interface FuneralMessage {
  id: string;
  caseId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface ChurchProject {
  id: string;
  name: string;
  description: string;
  type: 'construction' | 'mission' | 'equipment' | 'other';
  totalBudget: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'ongoing' | 'completed';
  imageUrl?: string;
  leaderId: string; // Member ID
  churchId: string;
  createdAt: string;
}

export interface ProjectContribution {
  id: string;
  projectId: string;
  contributorName: string;
  memberId?: string;
  amount: number;
  date: string;
  isAnonymous: boolean;
}

export interface ProjectExpense {
  id: string;
  projectId: string;
  category: 'materials' | 'labor' | 'logistics' | 'other';
  description: string;
  amount: number;
  date: string;
  receiptUrl?: string;
}

export interface ProjectStep {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'pending' | 'ongoing' | 'completed';
  order: number;
}

export interface ProjectMedia {
  id: string;
  projectId: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  type: 'service' | 'event' | 'department' | 'project' | 'other';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  recurrence?: 'none' | 'weekly' | 'bi-weekly' | 'monthly';
  churchId: string;
  createdAt: string;
}

export interface AssignmentMember {
  id: string;
  assignmentId: string;
  memberId: string;
  role: 'leader' | 'assistant' | 'participant';
  status: 'confirmed' | 'pending' | 'declined' | 'absent' | 'present';
  replacementId?: string; // Member ID of the person replacing
}

export interface MemberAvailability {
  id: string;
  memberId: string;
  dayOfWeek: number; // 0-6
  isAvailable: boolean;
  note?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructorId: string; // Member ID
  duration: string;
  status: 'planned' | 'ongoing' | 'completed';
  imageUrl?: string;
  objectives: string[];
  churchId: string;
  createdAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
}

export interface CourseLesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  verse?: string;
  videoUrl?: string;
  pdfUrl?: string;
  order: number;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  memberId: string;
  progress: number; // 0-100
  status: 'enrolled' | 'completed';
  enrolledAt: string;
  completedAt?: string;
  completedLessons: string[]; // Lesson IDs
}

export interface CourseQuiz {
  id: string;
  courseId: string;
  title: string;
  questions: { id: string; question: string; options: string[]; correctOption: number }[];
}

export interface CourseResource {
  id: string;
  courseId: string;
  title: string;
  url: string;
  type: 'pdf' | 'video' | 'doc';
}

export interface CourseSubject {
  id: string;
  courseId: string;
  name: string;
  coefficient?: number;
}

export interface CourseGrade {
  id: string;
  enrollmentId: string;
  subjectId: string;
  value: number;
  comment?: string;
  date: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  icon?: string;
  churchId: string;
  createdAt: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  description?: string;
  folderId?: string;
  type: 'pdf' | 'word' | 'excel' | 'image' | 'video';
  url: string;
  size: number; // in bytes
  authorId: string;
  isFavorite: boolean;
  accessLevel: 'admin' | 'responsible' | 'public';
  version: number;
  linkedTo?: { type: 'service' | 'event' | 'course'; id: string };
  churchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: string;
  fileId: string;
  version: number;
  url: string;
  updatedBy: string;
  createdAt: string;
}

export interface Baptism {
  id: string;
  type: 'child' | 'adult';
  date: string;
  location: string;
  pastor: string;
  
  // Candidate
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  birthDate: string;
  nationality?: string;
  phone?: string;
  email?: string;
  address?: string;
  
  // Family (if child)
  fatherName?: string;
  motherName?: string;
  parentPhone?: string;
  
  // Spiritual
  conversionDate?: string;
  isTraining: boolean;
  trainingLevel?: 'new' | 'in_progress' | 'ready';
  spiritualLeader?: string;
  
  // Godparents
  godparentName?: string;
  godparentPhone?: string;
  godparentRelation?: string;
  
  // Validation
  status: 'pending' | 'validated' | 'refused';
  approvedBy?: string;
  validationDate?: string;
  
  // Notes
  notes?: string;
  
  churchId: string;
  createdAt: string;
}

export interface Wedding {
  id: string;
  date: string;
  time: string;
  location: string;
  pastor: string;
  
  // Groom
  groomFirstName: string;
  groomLastName: string;
  groomBirthDate: string;
  groomNationality?: string;
  groomProfession?: string;
  groomPhone: string;
  groomAddress: string;
  groomStatus: 'single' | 'divorced' | 'widowed';
  
  // Bride
  brideFirstName: string;
  brideLastName: string;
  brideBirthDate: string;
  brideNationality?: string;
  brideProfession?: string;
  bridePhone: string;
  brideAddress: string;
  brideStatus: 'single' | 'divorced' | 'widowed';
  
  // Family
  groomFatherName?: string;
  groomMotherName?: string;
  brideFatherName?: string;
  brideMotherName?: string;
  
  // Witnesses
  witnesses: {
    name: string;
    phone: string;
    relation: string;
  }[];
  
  // Spiritual
  groomIsBaptized: boolean;
  groomIsMember: boolean;
  brideIsBaptized: boolean;
  brideIsMember: boolean;
  hasWeddingPrep: boolean;
  
  // Preparation
  prepSessions: { date: string }[];
  prepLeader?: string;
  prepStatus: 'in_progress' | 'completed';
  
  // Validation
  status: 'pending' | 'validated' | 'refused';
  approvedBy?: string;
  validationDate?: string;
  
  // Notes
  notes?: string;
  specialInstructions?: string;
  
  churchId: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'tithe' | 'offering' | 'donation' | 'expense';
  amount: number;
  category: string;
  churchId: string;
  memberId?: string;
  date: string;
  paymentMethod: 'Cash' | 'Mobile Money' | 'Bank';
  notes?: string;
}

export interface Attendance {
  id: string;
  churchId: string;
  date: string;
  count: number;
  notes?: string;
}

export interface MerchandiseItem {
  id: string;
  name: string;
  description?: string;
  price: number; // Sales price
  purchasePrice?: number; // Added field
  stock?: number;
  imageUrls?: string[]; // Changed from imageUrl to imageUrls
}

export interface Event {
  id: string;
  name: string;
  type: 'conference' | 'crusade' | 'seminar' | 'concert' | 'retreat' | 'special' | 'other';
  customType?: string;
  isPublished?: boolean;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  organizerId: string; // Department ID
  bannerUrl?: string;
  capacityLimit?: number;
  isPaid: boolean;
  price?: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  speakers?: string[];
  galleryUrls?: string[];
  churchId: string;
  merchandise?: MerchandiseItem[];
}

export interface EventOrder {
  id: string;
  eventId: string;
  itemId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'delivered' | 'cancelled';
  orderedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  registeredAt: string;
  isCheckedIn: boolean;
  checkInTime?: string;
  qrCode?: string;
  attendedDates?: string[];
  status: 'registered' | 'attended' | 'cancelled';
}

export interface EventTeam {
  id: string;
  eventId: string;
  name: string;
  members: string[]; // Member IDs
  tasks: { id: string; title: string; isCompleted: boolean; assignedTo?: string }[];
}

export interface Department {
  id: string;
  name: string;
  type: 'ministry' | 'department' | 'group';
  leaderId: string;
  assistantIds: string[];
  leadershipIds: string[];
  description: string;
  mission: string;
  verse?: string;
  motto?: string;
  meetingDays: string[];
  meetingTime?: string;
  location: string;
  frequency: 'weekly' | 'monthly' | 'occasional';
  color: string;
  icon: string;
  logoUrl?: string;
  churchId: string;
  status: 'active' | 'paused';
  createdAt: string;
  trackingOptions: {
    attendance: boolean;
    activities: boolean;
  };
  communication: {
    createGroup: boolean;
  };
  permissions: {
    visibility: 'all' | 'leaders';
    modification: 'admin' | 'leader';
  };
  notifications: {
    meetings: boolean;
    activities: boolean;
    announcements: boolean;
  };
  links: {
    events: boolean;
    services: boolean;
    projects: boolean;
  };
}

export interface DepartmentMember {
  id: string;
  departmentId: string;
  memberId: string;
  role: 'leader' | 'assistant' | 'member';
  joinedAt: string;
  status: 'active' | 'inactive';
}

export interface DepartmentActivity {
  id: string;
  departmentId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'meeting' | 'rehearsal' | 'prayer' | 'training';
  isPublished?: boolean;
  imageUrl?: string;
  attendance?: string[]; // Member IDs
}

export interface DepartmentGoal {
  id: string;
  departmentId: string;
  title: string;
  target: number;
  current: number;
  month: string;
}

export interface Service {
  id: string;
  type: 'sunday' | 'vigil' | 'fast' | 'special' | 'other';
  customType?: string;
  date: string;
  startTime: string;
  theme: string;
  preacher: string;
  location: string;
  expectedCapacity: number;
  verseOfDay?: string;
  imageUrl?: string;
  churchId: string;
  status: 'planned' | 'live' | 'completed';
  isPublished?: boolean;
  summary?: {
    adults: number;
    children: number;
    visitors: number;
    totalOfferings: number;
    keyPoints: string;
    presentMemberIds?: string[];
  };
  videoLinks?: { platform: 'youtube' | 'facebook', url: string }[];
  files?: { name: string, url: string }[];
}

export interface ServiceProgramItem {
  id: string;
  serviceId: string;
  title: string;
  responsibleId: string;
  duration: number; // in minutes
  order: number;
  isCompleted: boolean;
}

export interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  phone: string;
  originAddress?: string;
  residenceAddress?: string;
  invitedBy?: string;
  firstVisitDate: string;
  serviceId: string;
  status: 'first_visit' | 'followed_up' | 'member_prospect';
}

export interface ServiceFinance {
  id: string;
  serviceId: string;
  type: 'offering' | 'tithe' | 'donation';
  amount: number;
  memberId?: string;
  notes?: string;
}

interface AppState {
  churches: Church[];
  members: Member[];
  children: Child[];
  departments: Department[];
  departmentMembers: DepartmentMember[];
  departmentActivities: DepartmentActivity[];
  departmentGoals: DepartmentGoal[];
  services: Service[];
  servicePrograms: ServiceProgramItem[];
  visitors: Visitor[];
  serviceFinances: ServiceFinance[];
  events: Event[];
  eventRegistrations: EventRegistration[];
  eventTeams: EventTeam[];
  transactions: Transaction[];
  attendance: Attendance[];
  pastoralNotes: PastoralNote[];
  trainings: Training[];
  childCheckIns: ChildCheckIn[];
  childClasses: ChildClass[];
  childLessons: ChildLesson[];
  childReports: ChildReport[];
  contributionTypes: ContributionType[];
  contributionPayments: ContributionPayment[];
  contributionGoals: ContributionGoal[];
  funeralCases: FuneralCase[];
  funeralContributions: FuneralContribution[];
  funeralExpenses: FuneralExpense[];
  funeralTasks: FuneralTask[];
  funeralMessages: FuneralMessage[];
  churchProjects: ChurchProject[];
  projectContributions: ProjectContribution[];
  projectExpenses: ProjectExpense[];
  projectSteps: ProjectStep[];
  projectMedia: ProjectMedia[];
  assignments: Assignment[];
  assignmentMembers: AssignmentMember[];
  memberAvailabilities: MemberAvailability[];
  courses: Course[];
  courseModules: CourseModule[];
  courseLessons: CourseLesson[];
  courseEnrollments: CourseEnrollment[];
  courseQuizzes: CourseQuiz[];
  courseResources: CourseResource[];
  courseSubjects: CourseSubject[];
  courseGrades: CourseGrade[];
  documentFolders: DocumentFolder[];
  documentFiles: DocumentFile[];
  documentVersions: DocumentVersion[];
  baptisms: Baptism[];
  weddings: Wedding[];
  eventOrders: EventOrder[];
  
  // Auth state
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (emailOrIdentifier: string, password: string) => User | null;
  logout: () => void;
  
  platformStats: PlatformStats;
  subscriptionPlans: SubscriptionPlan[];
  subscriptions: ChurchSubscription[];
  
  addChurch: (church: Omit<Church, 'id' | 'createdAt'>) => void;
  updateChurch: (id: string, church: Partial<Church>) => void;
  deleteChurch: (id: string) => void;
  
  addMember: (member: Omit<Member, 'id' | 'joinedAt'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;

  addChild: (child: Omit<Child, 'id' | 'joinedAt'>) => void;
  updateChild: (id: string, child: Partial<Child>) => void;
  deleteChild: (id: string) => void;

  addDepartment: (dept: Omit<Department, 'id' | 'createdAt'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  addDeptMember: (dm: Omit<DepartmentMember, 'id' | 'joinedAt'>) => void;
  updateDeptMember: (id: string, dm: Partial<DepartmentMember>) => void;
  deleteDeptMember: (id: string) => void;

  addDeptActivity: (activity: Omit<DepartmentActivity, 'id'>) => void;
  updateDeptActivity: (id: string, activity: Partial<DepartmentActivity>) => void;
  deleteDeptActivity: (id: string) => void;
  addDeptGoal: (goal: Omit<DepartmentGoal, 'id'>) => void;
  updateDeptGoal: (id: string, goal: Partial<DepartmentGoal>) => void;

  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;

  addServiceProgramItem: (item: Omit<ServiceProgramItem, 'id'>) => void;
  updateServiceProgramItem: (id: string, item: Partial<ServiceProgramItem>) => void;
  deleteServiceProgramItem: (id: string) => void;

  addVisitor: (visitor: Omit<Visitor, 'id'>) => void;
  updateVisitor: (id: string, visitor: Partial<Visitor>) => void;

  addServiceFinance: (finance: Omit<ServiceFinance, 'id'>) => void;

  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;

  addEventRegistration: (reg: Omit<EventRegistration, 'id'>) => void;
  updateEventRegistration: (id: string, reg: Partial<EventRegistration>) => void;

  addEventOrder: (order: Omit<EventOrder, 'id'>) => void;
  updateEventOrder: (id: string, order: Partial<EventOrder>) => void;
  deleteEventOrder: (id: string) => void;

  addEventTeam: (team: Omit<EventTeam, 'id'>) => void;
  updateEventTeam: (id: string, team: Partial<EventTeam>) => void;
  deleteEventTeam: (id: string) => void;
  
  addPastoralNote: (note: Omit<PastoralNote, 'id'>) => void;
  deletePastoralNote: (id: string) => void;
  
  addTraining: (training: Omit<Training, 'id'>) => void;
  updateTraining: (id: string, training: Partial<Training>) => void;
  deleteTraining: (id: string) => void;
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addAttendance: (attendance: Omit<Attendance, 'id'>) => void;

  addChildCheckIn: (checkIn: Omit<ChildCheckIn, 'id'>) => void;
  updateChildCheckIn: (id: string, checkIn: Partial<ChildCheckIn>) => void;
  
  addChildClass: (childClass: Omit<ChildClass, 'id'>) => void;
  updateChildClass: (id: string, childClass: Partial<ChildClass>) => void;
  deleteChildClass: (id: string) => void;

  addChildLesson: (lesson: Omit<ChildLesson, 'id'>) => void;
  
  addChildReport: (report: Omit<ChildReport, 'id'>) => void;
  
  updateChildPoints: (id: string, points: number) => void;
  addChildBadge: (id: string, badge: string) => void;

  addContributionType: (type: Omit<ContributionType, 'id'>) => void;
  updateContributionType: (id: string, type: Partial<ContributionType>) => void;
  deleteContributionType: (id: string) => void;

  addContributionPayment: (payment: Omit<ContributionPayment, 'id'>) => void;
  updateContributionPayment: (id: string, payment: Partial<ContributionPayment>) => void;

  addContributionGoal: (goal: Omit<ContributionGoal, 'id'>) => void;
  updateContributionGoal: (id: string, goal: Partial<ContributionGoal>) => void;

  addFuneralCase: (fCase: Omit<FuneralCase, 'id' | 'createdAt'>) => void;
  updateFuneralCase: (id: string, fCase: Partial<FuneralCase>) => void;
  
  addFuneralContribution: (contribution: Omit<FuneralContribution, 'id'>) => void;
  addFuneralExpense: (expense: Omit<FuneralExpense, 'id'>) => void;
  addFuneralTask: (task: Omit<FuneralTask, 'id'>) => void;
  updateFuneralTask: (id: string, task: Partial<FuneralTask>) => void;
  addFuneralMessage: (message: Omit<FuneralMessage, 'id' | 'createdAt'>) => void;

  addChurchProject: (project: Omit<ChurchProject, 'id' | 'createdAt'>) => void;
  updateChurchProject: (id: string, project: Partial<ChurchProject>) => void;
  deleteChurchProject: (id: string) => void;

  addProjectContribution: (contribution: Omit<ProjectContribution, 'id'>) => void;
  addProjectExpense: (expense: Omit<ProjectExpense, 'id'>) => void;
  addProjectStep: (step: Omit<ProjectStep, 'id'>) => void;
  updateProjectStep: (id: string, step: Partial<ProjectStep>) => void;
  addProjectMedia: (media: Omit<ProjectMedia, 'id' | 'createdAt'>) => void;

  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  addAssignmentMember: (am: Omit<AssignmentMember, 'id'>) => void;
  updateAssignmentMember: (id: string, am: Partial<AssignmentMember>) => void;
  deleteAssignmentMember: (id: string) => void;

  updateMemberAvailability: (availability: Omit<MemberAvailability, 'id'>) => void;

  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  addCourseModule: (module: Omit<CourseModule, 'id'>) => void;
  updateCourseModule: (id: string, module: Partial<CourseModule>) => void;
  deleteCourseModule: (id: string) => void;
  addCourseLesson: (lesson: Omit<CourseLesson, 'id'>) => void;
  updateCourseLesson: (id: string, lesson: Partial<CourseLesson>) => void;
  deleteCourseLesson: (id: string) => void;
  
  enrollMember: (courseId: string, memberId: string) => void;
  updateProgress: (enrollmentId: string, lessonId: string) => void;
  updateCourseEnrollment: (id: string, enrollment: Partial<CourseEnrollment>) => void;
  
  addCourseQuiz: (quiz: Omit<CourseQuiz, 'id'>) => void;
  addCourseResource: (resource: Omit<CourseResource, 'id'>) => void;
  addCourseSubject: (subject: Omit<CourseSubject, 'id'>) => void;
  deleteCourseSubject: (id: string) => void;
  addCourseGrade: (grade: Omit<CourseGrade, 'id'>) => void;
  updateCourseGrade: (id: string, grade: Partial<CourseGrade>) => void;

  addDocumentFolder: (folder: Omit<DocumentFolder, 'id' | 'createdAt'>) => void;
  updateDocumentFolder: (id: string, folder: Partial<DocumentFolder>) => void;
  deleteDocumentFolder: (id: string) => void;

  addDocumentFile: (file: Omit<DocumentFile, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => void;
  updateDocumentFile: (id: string, file: Partial<DocumentFile>) => void;
  deleteDocumentFile: (id: string) => void;
  toggleFavoriteDocument: (id: string) => void;

  users: User[];
  auditLogs: AuditLog[];
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'status'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;

  conversations: Conversation[];
  messages: Message[];
  addConversation: (conversation: Omit<Conversation, 'id' | 'lastMessageId'>) => string;
  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'readBy'>) => void;
  markAsRead: (conversationId: string, userId: string) => void;

  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'readBy'>) => void;
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  markAnnouncementAsRead: (announcementId: string, userId: string) => void;

  addBaptism: (baptism: Omit<Baptism, 'id' | 'createdAt'>) => void;
  updateBaptism: (id: string, baptism: Partial<Baptism>) => void;
  deleteBaptism: (id: string) => void;

  addWedding: (wedding: Omit<Wedding, 'id' | 'createdAt'>) => void;
  updateWedding: (id: string, wedding: Partial<Wedding>) => void;
  deleteWedding: (id: string) => void;
}

export interface Announcement {
  id: string;
  churchId: string;
  title: string;
  description: string;
  category: 'event' | 'training' | 'volunteering' | 'urgent' | 'general';
  status: 'active' | 'expired' | 'upcoming';
  startDate: string;
  endDate: string;
  targetAudience: 'all' | { type: 'department' | 'project' | 'training'; id: string };
  isUrgent: boolean;
  attachments?: { name: string; url: string; type: string }[];
  readBy: string[];
  createdAt: string;
  imageUrl?: string;
  actionLink?: { label: string; url: string };
  merchandise?: MerchandiseItem[];
}

export interface Conversation {
  id: string;
  type: 'individual' | 'group';
  name?: string;
  participants: string[];
  lastMessageId?: string;
  churchId: string;
  metadata?: {
    type: 'department' | 'project' | 'event' | 'general';
    id?: string;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  readBy: string[];
  isUrgent?: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  role: 'super_admin' | 'church_admin' | 'admin' | 'treasurer' | 'responsible' | 'member';
  position?: string;
  identifier?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  lastLogin?: string;
  departmentId?: string;
  churchId?: string;
  tabAccess?: string[];
  resetPasswordRequired?: boolean;
  createdAt: string;
}

export interface PlatformStats {
  totalChurches: number;
  activeChurches: number;
  suspendedChurches: number;
  pendingChurches: number;
  totalRevenue: number;
  totalUsers: number;
}

export interface SubscriptionPlan {
  id: string;
  name: 'Gratuit' | 'Standard' | 'Premium';
  price: number;
  limits: {
    members: number;
    storage: string;
    modules: string[];
  };
}

export interface ChurchSubscription {
  id: string;
  churchId: string;
  planId: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'suspended';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  details?: string;
  timestamp: string;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      churches: [
        {
          id: '1',
          name: 'AD Adjamé - Temple de la Grâce',
          code: '4827',
          address: 'Adjamé, 220 Logements, Abidjan',
          phone: '+225 07 07 07 07 07',
          email: 'adjame@ekklesia.org',
          description: 'Une église dynamique au cœur d\'Abidjan.',
          city: 'Abidjan',
          country: 'Côte d\'Ivoire',
          pastor: 'Pasteur Yao',
          status: 'active',
          type: 'central',
          logoUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=200&q=80',
          createdAt: '2023-01-01T00:00:00Z',
          officials: [
            { id: 'off1', name: 'Pasteur Yao Koffi', role: 'Pasteur Principal / Fondateur', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', gender: 'M' },
            { id: 'off2', name: 'Maman Yao Sarah', role: 'Épouse du Pasteur / Co-fondatrice', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', gender: 'F' },
            { id: 'off3', name: 'Dr. Jean-Pierre Amany', role: 'Ancien', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', gender: 'M' },
            { id: 'off4', name: 'Mlle Rose Konan', role: 'Secrétaire Générale', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80', gender: 'F' },
            { id: 'off5', name: 'M. Ibrahim Touré', role: 'Responsable de Département', department: 'Louange & Adoration', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', gender: 'M' },
            { id: 'off6', name: 'Mme Alice Bakayoko', role: 'Diaconesse', photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80', gender: 'F' },
            { id: 'off7', name: 'M. Samuel Kouadio', role: 'Diacre', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80', gender: 'M' },
            { id: 'off8', name: 'Mme Esther N\'guessan', role: 'Responsable de Département', department: 'École du Dimanche', photoUrl: 'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=200&q=80', gender: 'F' },
          ],
          stats: {
            adults: { m: 145, f: 182 },
            children: { m: 64, f: 78 }
          },
          publishedContributions: [
            {
              id: 'c1',
              title: 'Soutien Obsèques - Famille Kouadio',
              description: 'Levée de fonds pour soutenir la famille Kouadio suite au décès de leur fils.',
              amount: 5000,
              type: 'funeral',
              deceasedDetails: {
                name: 'Kouadio Kouassi Jeannot',
                photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
                familyMemberName: 'M. Kouadio Samuel (Diacre)',
                relationship: 'Fils'
              }
            },
            {
              id: 'c2',
              title: 'Action de Grâce Annuelle',
              description: 'Contribution volontaire pour les festivités de fin d\'année.',
              type: 'special'
            }
          ],
          publishedProjects: [
            {
              id: 'p1',
              title: 'Construction du Nouveau Temple',
              description: 'Projet d\'extension de notre sanctuaire pour accueillir plus de fidèles.',
              targetAmount: 50000000,
              currentAmount: 12500000,
              imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80'
            },
            {
              id: 'p2',
              title: 'Achat d\'un Nouveau Sonorisation',
              description: 'Amélioration de la qualité sonore pour nos cultes et événements.',
              targetAmount: 2000000,
              currentAmount: 800000,
              imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'
            }
          ],
          publishedTrainings: [
            {
              id: 't1',
              title: 'École des Disciples - Niveau 1',
              description: 'Fondements de la foi chrétienne et vie de disciple.',
              startDate: '2026-06-01',
              instructor: 'Pasteur Yao Koffi',
              imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb28f74b671?w=800&q=80'
            },
            {
              id: 't2',
              title: 'Leadership Chrétien',
              description: 'Développer son leadership selon le modèle biblique.',
              startDate: '2026-07-15',
              instructor: 'Dr. Jean-Pierre Amany',
              imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80'
            }
          ]
        },
        {
          id: '2',
          name: 'AD Riviera - Cité de l\'Espoir',
          code: '5123',
          address: 'Riviera Palmeraie, Abidjan',
          phone: '+225 05 05 05 05 05',
          email: 'riviera@ekklesia.org',
          description: 'Une communauté vibrante pour la gloire de Dieu.',
          city: 'Abidjan',
          country: 'Côte d\'Ivoire',
          pastor: 'Pasteur Koffi',
          status: 'active',
          type: 'branch',
          logoUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=200&q=80',
          createdAt: '2023-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'AD Bouaké - Temple Bethel',
          code: '8841',
          address: 'Quartier Commerce, Bouaké',
          phone: '+225 01 01 01 01 01',
          email: 'bouake@ekklesia.org',
          description: 'Le phare de la foi au centre du pays.',
          city: 'Bouaké',
          country: 'Côte d\'Ivoire',
          pastor: 'Pasteur N\'Guessan',
          status: 'active',
          type: 'branch',
          logoUrl: 'https://images.unsplash.com/photo-1518391846015-55a9cf00px8b?w=200&q=80',
          createdAt: '2023-01-01T00:00:00Z'
        },
        {
          id: '4',
          name: 'AD Yopougon - Cité de Miracles',
          code: '7729',
          address: 'Yopougon Selmer, Abidjan',
          phone: '+225 01 02 03 04 05',
          email: 'yopougon@ekklesia.org',
          description: 'Une église en pleine croissance.',
          city: 'Abidjan',
          country: 'Côte d\'Ivoire',
          pastor: 'Pasteur Sanogo',
          status: 'pending',
          type: 'branch',
          logoUrl: 'https://images.unsplash.com/photo-1545624903-518391846015?w=200&q=80',
          createdAt: new Date().toISOString()
        }
      ],
      users: [
        {
          id: 'super-admin-1',
          firstName: 'Super',
          lastName: 'Admin',
          email: 'nexocodeinfo@gmail.com',
          role: 'super_admin',
          identifier: '26',
          status: 'active',
          churchId: undefined,
          createdAt: new Date().toISOString()
        },
        { id: '1', firstName: 'Jean', lastName: 'Koffi', email: 'jean.koffi@email.com', role: 'church_admin', status: 'active', lastLogin: '2026-04-08T10:00:00Z', churchId: '1', createdAt: '2023-01-01' },
        { id: '2', firstName: 'Marie', lastName: 'Nguessan', email: 'marie.n@email.com', role: 'treasurer', status: 'active', lastLogin: '2026-04-07T15:30:00Z', churchId: '1', createdAt: '2023-03-20' },
        { id: '3', firstName: 'Kouassi', lastName: 'Bertin', email: 'k.bertin@email.com', role: 'responsible', status: 'active', lastLogin: '2026-04-08T08:45:00Z', churchId: '1', createdAt: '2024-01-10' },
      ],
      platformStats: {
        totalChurches: 3,
        activeChurches: 3,
        suspendedChurches: 0,
        pendingChurches: 0,
        totalRevenue: 250000,
        totalUsers: 450
      },
      subscriptionPlans: [
        { id: 'free', name: 'Gratuit', price: 0, limits: { members: 50, storage: '500MB', modules: ['members', 'services'] } },
        { id: 'standard', name: 'Standard', price: 15000, limits: { members: 500, storage: '5GB', modules: ['members', 'services', 'finances', 'projects'] } },
        { id: 'premium', name: 'Premium', price: 45000, limits: { members: 5000, storage: '50GB', modules: ['all'] } },
      ],
      subscriptions: [
        { id: 's1', churchId: '1', planId: 'premium', startDate: '2024-01-01', expiryDate: '2025-01-01', status: 'active' },
        { id: 's2', churchId: '2', planId: 'standard', startDate: '2024-02-01', expiryDate: '2025-02-01', status: 'active' },
        { id: 's3', churchId: '3', planId: 'free', startDate: '2024-03-01', expiryDate: '2025-03-01', status: 'active' },
      ],
      isAuthenticated: false,
      currentUser: null,
      login: (emailOrIdentifier, password) => {
        const { users } = get();
        const input = emailOrIdentifier.trim().toLowerCase();
        const pass = password.trim();
        
        // Find user by email or identifier
        const user = users.find(u => 
          (u.email.toLowerCase() === input || u.identifier === input) && 
          (pass === 'admin' || pass === 'graceconnect')
        );

        if (user) {
          set({ isAuthenticated: true, currentUser: user });
          return user;
        }

        // Hard fallback for Super Admin in case state is somehow corrupted
        if ((input === 'nexocodeinfo@gmail.com' || input === '26') && pass === 'admin') {
          const superAdmin: User = {
            id: 'super-admin-1',
            firstName: 'Super',
            lastName: 'Admin',
            email: 'nexocodeinfo@gmail.com',
            role: 'super_admin',
            identifier: '26',
            status: 'active',
            createdAt: new Date().toISOString()
          };
          // Also update the store users list if missing
          if (!users.some(u => u.id === superAdmin.id)) {
            set({ users: [superAdmin, ...users] });
          }
          set({ isAuthenticated: true, currentUser: superAdmin });
          return superAdmin;
        }

        // Legacy admin fallback
        if (input === 'admin@ekklesia.africa' && pass === 'admin123') {
          const legacyAdmin: User = {
            id: '1',
            firstName: 'Jean',
            lastName: 'Koffi',
            email: 'admin@ekklesia.africa',
            phone: '0707070707',
            churchId: '1',
            role: 'church_admin',
            status: 'active',
            createdAt: new Date().toISOString()
          };
          set({ isAuthenticated: true, currentUser: legacyAdmin });
          return legacyAdmin;
        }

        return null;
      },
      logout: () => set({ isAuthenticated: false, currentUser: null }),
      members: [
        { id: '1', firstName: 'Jean', lastName: 'Koffi', matricule: '26-4827-0001-H', email: 'jean.koffi@email.com', phone: '0707070707', churchId: '1', groups: ['Conseil', 'Chorale'], status: 'active', joinedAt: '2023-01-15', gender: 'M', engagementLevel: 'leader', role: 'Ancien', isBaptized: true },
        { id: '2', firstName: 'Marie', lastName: 'Nguessan', matricule: '26-4827-0002-F', email: 'marie.n@email.com', phone: '0505050505', churchId: '1', groups: ['Femmes'], status: 'active', joinedAt: '2023-03-20', gender: 'F', engagementLevel: 'active', isBaptized: true },
        { id: '3', firstName: 'Kouassi', lastName: 'Bertin', matricule: '26-0001-0003-H', email: 'k.bertin@email.com', phone: '0101010101', churchId: 'default', groups: ['Jeunesse'], status: 'active', joinedAt: '2024-01-10', gender: 'M', engagementLevel: 'new', isBaptized: false },
        { id: '4', firstName: 'Awa', lastName: 'Coulibaly', matricule: '26-4827-0004-F', email: 'awa.c@email.com', phone: '0808080808', churchId: '1', groups: ['Chorale'], status: 'active', joinedAt: '2024-02-05', gender: 'F', engagementLevel: 'leader', role: 'Maître de Chœur', isBaptized: true },
        { id: '5', firstName: 'Paul', lastName: 'Yao', matricule: '26-0001-0005-H', email: 'paul.yao@email.com', phone: '0909090909', churchId: 'default', groups: ['Sécurité'], status: 'inactive', joinedAt: '2022-11-12', gender: 'M', engagementLevel: 'new', role: 'Diacre', isBaptized: true },
      ],
      children: [
        { 
          id: '1', 
          firstName: 'Jean', 
          lastName: 'Koffi', 
          matricule: '26-4827-0001-H',
          birthDate: '2018-05-12', 
          gender: 'M', 
          parentId: '1', 
          churchId: '1', 
          joinedAt: '2024-01-10',
          points: 150,
          badges: ['Assiduité', 'Participation'],
          authorizedPickups: [
            { name: 'Mme Koffi', phone: '0707070707', relation: 'Mère', photoUrl: 'https://picsum.photos/seed/mom/200' },
            { name: 'Oncle Marc', phone: '0101010101', relation: 'Oncle' }
          ],
          classId: '2',
          ageGroup: '6-10',
          mainPhone: '0707070707',
          fatherName: 'Jean Koffi Sr',
          motherName: 'Therèse Koffi',
          isNewAtChurch: false,
          participation: 'regular',
          emergencyContactName: 'Grand-père Koffi',
          emergencyContactRelation: 'Grand-père',
          emergencyContactPhone: '0808080808',
          status: 'active',
          allergies: 'Cacahuètes',
          teacherName: 'Mme Kouadio',
          notes: 'Enfant très brillant et attentif.',
          settings: {
            allowPhotosVideos: true,
            receiveNotifications: true
          }
        },
        { 
          id: '2', 
          firstName: 'Marie', 
          lastName: 'Nguessan', 
          matricule: '26-4827-0002-F',
          birthDate: '2021-08-20', 
          gender: 'F', 
          parentId: '2', 
          churchId: '1', 
          joinedAt: '2024-02-15',
          points: 80,
          badges: ['Sourire'],
          authorizedPickups: [
            { name: 'M. Nguessan', phone: '0505050505', relation: 'Père' }
          ],
          classId: '1',
          ageGroup: '0-5',
          mainPhone: '0505050505',
          fatherName: 'Kouassi Nguessan',
          motherName: 'Marie Nguessan Sr',
          isNewAtChurch: true,
          participation: 'occasional',
          emergencyContactName: 'Tante Alice',
          emergencyContactRelation: 'Tante',
          emergencyContactPhone: '0404040404',
          status: 'active',
          settings: {
            allowPhotosVideos: true,
            receiveNotifications: true
          }
        }
      ],
      departments: [
        { 
          id: '1', 
          name: 'Chorale', 
          type: 'department',
          leaderId: '1', 
          assistantIds: [],
          leadershipIds: [],
          description: 'Louange et adoration', 
          meetingDays: ['Samedi'], 
          meetingTime: '17:00',
          location: 'Salle B', 
          mission: 'Conduire le peuple dans la louange', 
          motto: 'Louez l\'Éternel !',
          frequency: 'weekly',
          color: '#3b82f6', 
          icon: 'Music', 
          churchId: '1', 
          status: 'active', 
          createdAt: '2023-01-01',
          trackingOptions: { attendance: true, activities: true },
          communication: { createGroup: true },
          permissions: { visibility: 'all', modification: 'leader' },
          notifications: { meetings: true, activities: true, announcements: true },
          links: { events: true, services: true, projects: false }
        },
        { 
          id: '2', 
          name: 'Jeunesse', 
          type: 'department',
          leaderId: '3', 
          assistantIds: [],
          leadershipIds: [],
          description: 'Activités pour les jeunes', 
          meetingDays: ['Vendredi'], 
          meetingTime: '18:00',
          location: 'Salle C', 
          mission: 'Formier la relève', 
          motto: 'Jeune et vaillant',
          frequency: 'weekly',
          color: '#10b981', 
          icon: 'Users', 
          churchId: '1', 
          status: 'active', 
          createdAt: '2023-01-01',
          trackingOptions: { attendance: true, activities: true },
          communication: { createGroup: true },
          permissions: { visibility: 'all', modification: 'leader' },
          notifications: { meetings: true, activities: true, announcements: true },
          links: { events: true, services: true, projects: false }
        },
      ],
      departmentMembers: [
        { id: '1', departmentId: '1', memberId: '1', role: 'leader', joinedAt: '2023-01-15', status: 'active' },
        { id: '2', departmentId: '1', memberId: '4', role: 'member', joinedAt: '2024-02-05', status: 'active' },
        { id: '3', departmentId: '2', memberId: '3', role: 'leader', joinedAt: '2024-01-10', status: 'active' },
      ],
      departmentActivities: [],
      departmentGoals: [],
      services: [
        { id: '1', type: 'sunday', date: '2026-04-05', startTime: '09:00', theme: 'La Puissance de la Foi', preacher: 'Pasteur Yao', location: 'Temple Principal', expectedCapacity: 300, churchId: '1', status: 'completed', summary: { adults: 245, children: 65, visitors: 12, totalOfferings: 150000, keyPoints: 'La foi déplace les montagnes.' } },
        { id: '2', type: 'sunday', date: '2026-03-29', startTime: '09:00', theme: 'L\'Amour de Dieu', preacher: 'Pasteur Yao', location: 'Temple Principal', expectedCapacity: 300, churchId: '1', status: 'completed', summary: { adults: 230, children: 58, visitors: 8, totalOfferings: 135000, keyPoints: 'Dieu nous a aimés le premier.' } },
        { id: '3', type: 'sunday', date: '2026-03-22', startTime: '09:00', theme: 'La Sainteté', preacher: 'Pasteur Yao', location: 'Temple Principal', expectedCapacity: 300, churchId: '1', status: 'completed', summary: { adults: 215, children: 50, visitors: 5, totalOfferings: 120000, keyPoints: 'Soyez saints car je suis saint.' } },
      ],
      servicePrograms: [],
      visitors: [],
      serviceFinances: [],
      events: [
        { id: '1', name: 'Conférence de Pâques', type: 'conference', startDate: '2026-04-03', endDate: '2026-04-05', location: 'Temple Principal', description: 'Célébration de la résurrection', organizerId: '1', isPaid: false, status: 'completed', churchId: '1' },
      ],
      eventRegistrations: [
        { id: '1', eventId: '1', firstName: 'Jean', lastName: 'Koffi', email: 'jean@email.com', phone: '0707070707', registeredAt: '2026-03-20', isCheckedIn: true, status: 'attended' },
        { id: '2', eventId: '1', firstName: 'Marie', lastName: 'Nguessan', email: 'marie@email.com', phone: '0505050505', registeredAt: '2026-03-21', isCheckedIn: true, status: 'attended' },
        { id: '3', eventId: '1', firstName: 'Inconnu', lastName: 'Visiteur', email: 'v@email.com', phone: '0101010101', registeredAt: '2026-03-25', isCheckedIn: false, status: 'registered' },
      ],
      eventTeams: [],
      eventOrders: [],
      transactions: [
        { id: '1', type: 'tithe', amount: 50000, category: 'Dîmes', churchId: '1', memberId: '1', date: '2026-04-05', paymentMethod: 'Cash' },
        { id: '2', type: 'offering', amount: 150000, category: 'Offrandes', churchId: '1', date: '2026-04-05', paymentMethod: 'Cash' },
        { id: '3', type: 'expense', amount: 45000, category: 'Électricité', churchId: '1', date: '2026-04-02', paymentMethod: 'Bank' },
        { id: '4', type: 'tithe', amount: 30000, category: 'Dîmes', churchId: '1', memberId: '2', date: '2026-04-05', paymentMethod: 'Mobile Money' },
        { id: '5', type: 'expense', amount: 120000, category: 'Matériel', churchId: '1', date: '2026-03-28', paymentMethod: 'Bank' },
        { id: '6', type: 'offering', amount: 200000, category: 'Offrandes', churchId: '1', date: '2026-04-12', paymentMethod: 'Cash' },
        { id: '7', type: 'tithe', amount: 45000, category: 'Dîmes', churchId: '1', memberId: '3', date: '2026-04-19', paymentMethod: 'Bank' },
        { id: '8', type: 'offering', amount: 120000, category: 'Offrandes', churchId: '1', date: '2026-04-23', paymentMethod: 'Cash' },
        { id: '9', type: 'tithe', amount: 60000, category: 'Dîmes', churchId: '1', memberId: '4', date: '2026-04-20', paymentMethod: 'Mobile Money' },
      ],
      attendance: [
        { id: '1', churchId: '1', date: '2026-04-05', count: 322 },
        { id: '2', churchId: '1', date: '2026-03-29', count: 296 },
        { id: '3', churchId: '1', date: '2026-03-22', count: 270 },
        { id: '4', churchId: '1', date: '2026-03-15', count: 285 },
        { id: '5', churchId: '1', date: '2026-04-12', count: 310 },
        { id: '6', churchId: '1', date: '2026-04-19', count: 345 },
        { id: '7', churchId: '1', date: '2026-04-23', count: 85 }, // Partial attendance for today
      ],
      pastoralNotes: [],
      trainings: [],
      childCheckIns: [],
      childClasses: [
        { id: '1', name: 'Petits (0-5 ans)', minAge: 0, maxAge: 5, teacherId: '1', room: 'Salle A', churchId: '1' },
        { id: '2', name: 'Moyens (6-10 ans)', minAge: 6, maxAge: 10, teacherId: '2', room: 'Salle B', churchId: '1' },
        { id: '3', name: 'Ados (11-15 ans)', minAge: 11, maxAge: 15, teacherId: '3', room: 'Salle C', churchId: '1' },
      ],
      childLessons: [
        { id: '1', classId: '1', date: new Date().toISOString(), theme: "L'obéissance de Noé", verse: "Genèse 7:5", content: "Histoire de Noé et de l'arche.", mediaUrls: [] },
        { id: '2', classId: '2', date: new Date().toISOString(), theme: "David et Goliath", verse: "1 Samuel 17:45", content: "La foi de David face au géant.", mediaUrls: [] },
      ],
      childReports: [],
      contributionTypes: [
        { id: '1', name: 'Cotisation Mensuelle', amount: 2000, frequency: 'monthly', churchId: '1' },
        { id: '2', name: 'Construction Temple', amount: 10000, frequency: 'one-time', deadline: '2026-12-31', churchId: '1' },
        { id: '3', name: 'Fonds de Solidarité', amount: 5000, frequency: 'monthly', churchId: '1' },
      ],
      contributionPayments: [
        { id: '1', memberId: '1', typeId: '1', amount: 2000, date: new Date().toISOString(), paymentMethod: 'Cash', status: 'paid' },
        { id: '2', memberId: '2', typeId: '1', amount: 2000, date: new Date().toISOString(), paymentMethod: 'Mobile Money', status: 'paid' },
      ],
      contributionGoals: [
        { id: '1', title: 'Objectif Mensuel Mars', targetAmount: 500000, currentAmount: 350000, deadline: '2026-03-31', churchId: '1' }
      ],
      funeralCases: [
        { 
          id: '1', 
          deceasedName: 'M. Kouassi Koffi', 
          familyContactId: '1', 
          dateOfDeath: '2026-03-15', 
          location: 'Abidjan, Cocody', 
          description: 'Père de notre frère Jean Koffi. Fidèle de longue date.', 
          status: 'active', 
          createdAt: '2026-03-16T10:00:00Z',
          churchId: '1'
        }
      ],
      funeralContributions: [
        { id: '1', caseId: '1', contributorName: 'Marie Nguessan', amount: 5000, date: '2026-03-17T14:00:00Z', paymentMethod: 'Wave' }
      ],
      funeralExpenses: [
        { id: '1', caseId: '1', category: 'transport', description: 'Transport délégation église', amount: 15000, date: '2026-03-18T09:00:00Z' }
      ],
      funeralTasks: [
        { id: '1', caseId: '1', title: 'Visite de consolation', assignedTo: '2', dueDate: '2026-03-20', status: 'completed', type: 'visit' }
      ],
      funeralMessages: [
        { id: '1', caseId: '1', authorName: 'Pasteur Yao', content: 'Que le Seigneur fortifie la famille Koffi dans cette épreuve.', createdAt: '2026-03-16T11:00:00Z' }
      ],
      churchProjects: [
        {
          id: '1',
          name: 'Construction du Nouveau Temple',
          description: 'Projet de construction d\'un temple de 500 places avec bureaux et salles de classe.',
          type: 'construction',
          totalBudget: 50000000,
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          status: 'ongoing',
          imageUrl: 'https://picsum.photos/seed/church/800/600',
          leaderId: '1',
          churchId: '1',
          createdAt: '2025-12-15T08:00:00Z'
        }
      ],
      projectContributions: [
        { id: '1', projectId: '1', contributorName: 'Jean Koffi', amount: 500000, date: '2026-02-10T10:00:00Z', isAnonymous: false },
        { id: '2', projectId: '1', contributorName: 'Anonyme', amount: 1000000, date: '2026-03-05T15:00:00Z', isAnonymous: true }
      ],
      projectExpenses: [
        { id: '1', projectId: '1', category: 'materials', description: 'Achat de ciment (100 sacs)', amount: 500000, date: '2026-02-15T09:00:00Z' }
      ],
      projectSteps: [
        { id: '1', projectId: '1', title: 'Fondations', description: 'Creusage et coulage des fondations', status: 'completed', order: 1 },
        { id: '2', projectId: '1', title: 'Élévation des murs', description: 'Pose des briques et poteaux', status: 'ongoing', order: 2 },
        { id: '3', projectId: '1', title: 'Toiture', description: 'Charpente et tôles', status: 'pending', order: 3 }
      ],
      projectMedia: [
        { id: '1', projectId: '1', url: 'https://picsum.photos/seed/build1/800/600', type: 'image', caption: 'Début des travaux', createdAt: '2026-01-15T10:00:00Z' }
      ],
      assignments: [
        {
          id: '1',
          title: 'Accueil Culte Dimanche',
          type: 'service',
          date: '2026-04-12',
          startTime: '08:00',
          endTime: '12:00',
          location: 'Entrée Principale',
          description: 'Accueil des fidèles et distribution des programmes.',
          status: 'planned',
          recurrence: 'weekly',
          churchId: '1',
          createdAt: '2026-04-01T10:00:00Z'
        }
      ],
      assignmentMembers: [
        { id: '1', assignmentId: '1', memberId: '1', role: 'leader', status: 'confirmed' },
        { id: '2', assignmentId: '1', memberId: '2', role: 'assistant', status: 'pending' }
      ],
      memberAvailabilities: [],
      courses: [
        {
          id: '1',
          title: 'Fondements de la Foi',
          description: 'Découvrez les bases essentielles de la vie chrétienne et de la doctrine biblique.',
          level: 'beginner',
          instructorId: '1',
          duration: '4 semaines',
          status: 'ongoing',
          imageUrl: 'https://picsum.photos/seed/faith/800/600',
          objectives: ['Comprendre le salut', 'Apprendre à prier', 'Étudier la Bible'],
          churchId: '1',
          createdAt: '2026-03-01T10:00:00Z'
        }
      ],
      courseModules: [
        { id: '1', courseId: '1', title: 'Introduction au Salut', order: 1 },
        { id: '2', courseId: '1', title: 'La Vie de Prière', order: 2 }
      ],
      courseLessons: [
        { id: '1', moduleId: '1', title: 'Qu\'est-ce que la Grâce ?', content: 'La grâce est un don gratuit de Dieu...', verse: 'Éphésiens 2:8', order: 1 },
        { id: '2', moduleId: '1', title: 'La Nouvelle Naissance', content: 'Jésus répondit: En vérité, en vérité...', verse: 'Jean 3:3', order: 2 }
      ],
      courseEnrollments: [
        { id: '1', courseId: '1', memberId: '1', progress: 50, status: 'enrolled', enrolledAt: '2026-03-10T08:00:00Z', completedLessons: ['1'] }
      ],
      courseQuizzes: [],
      courseResources: [
        { id: '1', courseId: '1', title: 'Guide du Nouveau Croyant', url: '#', type: 'pdf' }
      ],
      courseSubjects: [
        { id: '1', courseId: '1', name: 'Théologie Systématique', coefficient: 2 },
        { id: '2', courseId: '1', name: 'Vie de Prière', coefficient: 1 }
      ],
      courseGrades: [],
      documentFolders: [
        { id: '1', name: 'Administration', color: '#3b82f6', icon: 'Folder', churchId: '1', createdAt: new Date().toISOString() },
        { id: '2', name: 'Finances', color: '#10b981', icon: 'DollarSign', churchId: '1', createdAt: new Date().toISOString() },
        { id: '3', name: 'Cultes', color: '#f59e0b', icon: 'Mic2', churchId: '1', createdAt: new Date().toISOString() },
        { id: '4', name: 'Formations', color: '#8b5cf6', icon: 'GraduationCap', churchId: '1', createdAt: new Date().toISOString() },
        { id: '5', name: 'Événements', color: '#ec4899', icon: 'Calendar', churchId: '1', createdAt: new Date().toISOString() },
        { id: '6', name: 'Départements', color: '#64748b', icon: 'Users', churchId: '1', createdAt: new Date().toISOString() },
      ],
      documentFiles: [
        {
          id: '1',
          name: 'Rapport Annuel 2025.pdf',
          description: 'Rapport complet des activités de l\'année 2025.',
          folderId: '1',
          type: 'pdf',
          url: '#',
          size: 2500000,
          authorId: '1',
          isFavorite: true,
          accessLevel: 'admin',
          version: 1,
          churchId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      documentVersions: [],
      
      addChurch: (church) => set((state) => {
        let code = '';
        const existingCodes = state.churches.map(c => c.code).filter(Boolean);
        do {
          code = Math.floor(1000 + Math.random() * 9000).toString();
        } while (existingCodes.includes(code));

        return {
          churches: [...state.churches, { 
            ...church, 
            id: crypto.randomUUID(), 
            code,
            createdAt: new Date().toISOString() 
          }]
        };
      }),
      updateChurch: (id, church) => set((state) => ({
        churches: state.churches.map((c) => (c.id === id ? { ...c, ...church } : c))
      })),
      deleteChurch: (id) => set((state) => ({
        churches: state.churches.filter((c) => c.id !== id)
      })),
      
      addMember: (member) => set((state) => {
        const church = state.churches.find(c => c.id === member.churchId);
        const churchCode = church?.code || '0000';
        const platformId = '26';
        
        // Count existing members for this church to generate sequence
        const churchMembers = state.members.filter(m => m.churchId === member.churchId);
        const sequence = (churchMembers.length + 1).toString().padStart(4, '0');
        const letter = member.gender === 'M' ? 'H' : 'F';
        
        const matricule = `${platformId}-${churchCode}-${sequence}-${letter}`;

        return {
          members: [...state.members, { 
            ...member, 
            id: crypto.randomUUID(), 
            matricule,
            joinedAt: new Date().toISOString() 
          }]
        };
      }),
      updateMember: (id, member) => set((state) => ({
        members: state.members.map((m) => (m.id === id ? { ...m, ...member } : m))
      })),
      deleteMember: (id) => set((state) => ({
        members: state.members.map((m) => (m.id === id ? { ...m, status: 'archived', archivedAt: new Date().toISOString() } : m))
      })),

      addChild: (child) => set((state) => {
        const church = state.churches.find(c => c.id === child.churchId);
        const churchCode = church?.code || '0000';
        const platformId = '26';
        
        // Count existing children for this church to generate sequence
        const churchChildren = state.children.filter(c => c.churchId === child.churchId);
        // We can also combine with members count if we want unique IDs across both, 
        // but usually they are separate or combined. 
        // Let's keep it consistent with members sequence generation.
        const sequence = (churchChildren.length + 1).toString().padStart(4, '0');
        const letter = child.gender === 'M' ? 'H' : 'F';
        
        const matricule = `${platformId}-${churchCode}-${sequence}-${letter}`;

        return {
          children: [...state.children, { 
            ...child, 
            id: crypto.randomUUID(), 
            matricule,
            joinedAt: new Date().toISOString() 
          }]
        };
      }),
      updateChild: (id, child) => set((state) => ({
        children: state.children.map((c) => (c.id === id ? { ...c, ...child } : c))
      })),
      deleteChild: (id) => set((state) => ({
        children: state.children.filter((c) => c.id !== id)
      })),

      addDepartment: (dept) => set((state) => ({
        departments: [...state.departments, { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...dept }]
      })),
      updateDepartment: (id, dept) => set((state) => ({
        departments: state.departments.map((d) => (d.id === id ? { ...d, ...dept } : d))
      })),
      deleteDepartment: (id) => set((state) => ({
        departments: state.departments.filter((d) => d.id !== id)
      })),

      addDeptMember: (dm) => set((state) => ({
        departmentMembers: [...state.departmentMembers, { ...dm, id: crypto.randomUUID(), joinedAt: new Date().toISOString() }]
      })),
      updateDeptMember: (id, dm) => set((state) => ({
        departmentMembers: state.departmentMembers.map((m) => (m.id === id ? { ...m, ...dm } : m))
      })),
      deleteDeptMember: (id) => set((state) => ({
        departmentMembers: state.departmentMembers.filter((m) => m.id !== id)
      })),

      addDeptActivity: (activity) => set((state) => ({
        departmentActivities: [...state.departmentActivities, { ...activity, id: crypto.randomUUID(), attendance: [] }]
      })),
      updateDeptActivity: (id, activity) => set((state) => ({
        departmentActivities: state.departmentActivities.map((a) => (a.id === id ? { ...a, ...activity } : a))
      })),
      deleteDeptActivity: (id) => set((state) => ({
        departmentActivities: state.departmentActivities.filter((a) => a.id !== id)
      })),
      addDeptGoal: (goal) => set((state) => ({
        departmentGoals: [...state.departmentGoals, { ...goal, id: crypto.randomUUID() }]
      })),
      updateDeptGoal: (id, goal) => set((state) => ({
        departmentGoals: state.departmentGoals.map((g) => (g.id === id ? { ...g, ...goal } : g))
      })),

      addService: (service) => set((state) => ({
        services: [...state.services, { ...service, id: crypto.randomUUID() }]
      })),
      updateService: (id, service) => set((state) => ({
        services: state.services.map((s) => (s.id === id ? { ...s, ...service } : s))
      })),
      deleteService: (id) => set((state) => ({
        services: state.services.filter((s) => s.id !== id)
      })),

      addServiceProgramItem: (item) => set((state) => ({
        servicePrograms: [...state.servicePrograms, { ...item, id: crypto.randomUUID() }]
      })),
      updateServiceProgramItem: (id, item) => set((state) => ({
        servicePrograms: state.servicePrograms.map((p) => (p.id === id ? { ...p, ...item } : p))
      })),
      deleteServiceProgramItem: (id) => set((state) => ({
        servicePrograms: state.servicePrograms.filter((p) => p.id !== id)
      })),

      addVisitor: (visitor) => set((state) => ({
        visitors: [...state.visitors, { ...visitor, id: crypto.randomUUID() }]
      })),
      updateVisitor: (id, visitor) => set((state) => ({
        visitors: state.visitors.map((v) => (v.id === id ? { ...v, ...visitor } : v))
      })),

      addServiceFinance: (finance) => set((state) => ({
        serviceFinances: [...state.serviceFinances, { ...finance, id: crypto.randomUUID() }]
      })),

      addEvent: (event) => set((state) => ({
        events: [...state.events, { ...event, id: crypto.randomUUID() }]
      })),
      updateEvent: (id, event) => set((state) => ({
        events: state.events.map((e) => (e.id === id ? { ...e, ...event } : e))
      })),
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter((e) => e.id !== id)
      })),

      addEventRegistration: (reg) => set((state) => ({
        eventRegistrations: [...state.eventRegistrations, { ...reg, id: crypto.randomUUID() }]
      })),
      updateEventRegistration: (id, reg) => set((state) => ({
        eventRegistrations: state.eventRegistrations.map((r) => (r.id === id ? { ...r, ...reg } : r))
      })),

      addEventOrder: (order) => set((state) => ({
        eventOrders: [...state.eventOrders, { ...order, id: crypto.randomUUID(), orderedAt: new Date().toISOString() }]
      })),
      updateEventOrder: (id, order) => set((state) => ({
        eventOrders: state.eventOrders.map((o) => (o.id === id ? { ...o, ...order } : o))
      })),
      deleteEventOrder: (id) => set((state) => ({
        eventOrders: state.eventOrders.filter((o) => o.id !== id)
      })),

      addEventTeam: (team) => set((state) => ({
        eventTeams: [...state.eventTeams, { ...team, id: crypto.randomUUID() }]
      })),
      updateEventTeam: (id, team) => set((state) => ({
        eventTeams: state.eventTeams.map((t) => (t.id === id ? { ...t, ...team } : t))
      })),
      deleteEventTeam: (id) => set((state) => ({
        eventTeams: state.eventTeams.filter((t) => t.id !== id)
      })),

      addPastoralNote: (note) => set((state) => ({
        pastoralNotes: [...state.pastoralNotes, { ...note, id: crypto.randomUUID() }]
      })),
      deletePastoralNote: (id) => set((state) => ({
        pastoralNotes: state.pastoralNotes.filter((n) => n.id !== id)
      })),

      addTraining: (training) => set((state) => ({
        trainings: [...state.trainings, { ...training, id: crypto.randomUUID() }]
      })),
      updateTraining: (id, training) => set((state) => ({
        trainings: state.trainings.map((t) => (t.id === id ? { ...t, ...training } : t))
      })),
      deleteTraining: (id) => set((state) => ({
        trainings: state.trainings.filter((t) => t.id !== id)
      })),
      
      addTransaction: (transaction) => set((state) => ({
        transactions: [...state.transactions, { ...transaction, id: crypto.randomUUID() }]
      })),
      addAttendance: (attendance) => set((state) => ({
        attendance: [...state.attendance, { ...attendance, id: crypto.randomUUID() }]
      })),

      addChildCheckIn: (checkIn) => set((state) => ({
        childCheckIns: [...state.childCheckIns, { ...checkIn, id: crypto.randomUUID() }]
      })),
      updateChildCheckIn: (id, checkIn) => set((state) => ({
        childCheckIns: state.childCheckIns.map((c) => (c.id === id ? { ...c, ...checkIn } : c))
      })),

      addChildClass: (childClass) => set((state) => ({
        childClasses: [...state.childClasses, { ...childClass, id: crypto.randomUUID() }]
      })),
      updateChildClass: (id, childClass) => set((state) => ({
        childClasses: state.childClasses.map((c) => (c.id === id ? { ...c, ...childClass } : c))
      })),
      deleteChildClass: (id) => set((state) => ({
        childClasses: state.childClasses.filter((c) => c.id !== id)
      })),

      addChildLesson: (lesson) => set((state) => ({
        childLessons: [...state.childLessons, { ...lesson, id: crypto.randomUUID() }]
      })),

      addChildReport: (report) => set((state) => ({
        childReports: [...state.childReports, { ...report, id: crypto.randomUUID() }]
      })),

      updateChildPoints: (id, points) => set((state) => ({
        children: state.children.map((c) => (c.id === id ? { ...c, points: c.points + points } : c))
      })),
      addChildBadge: (id, badge) => set((state) => ({
        children: state.children.map((c) => (c.id === id ? { ...c, badges: [...c.badges, badge] } : c))
      })),

      addContributionType: (type) => set((state) => ({
        contributionTypes: [...state.contributionTypes, { ...type, id: crypto.randomUUID() }]
      })),
      updateContributionType: (id, type) => set((state) => ({
        contributionTypes: state.contributionTypes.map((t) => (t.id === id ? { ...t, ...type } : t))
      })),
      deleteContributionType: (id) => set((state) => ({
        contributionTypes: state.contributionTypes.filter((t) => t.id !== id)
      })),

      addContributionPayment: (payment) => set((state) => ({
        contributionPayments: [...state.contributionPayments, { ...payment, id: crypto.randomUUID() }]
      })),
      updateContributionPayment: (id, payment) => set((state) => ({
        contributionPayments: state.contributionPayments.map((p) => (p.id === id ? { ...p, ...payment } : p))
      })),

      addContributionGoal: (goal) => set((state) => ({
        contributionGoals: [...state.contributionGoals, { ...goal, id: crypto.randomUUID() }]
      })),
      updateContributionGoal: (id, goal) => set((state) => ({
        contributionGoals: state.contributionGoals.map((g) => (g.id === id ? { ...g, ...goal } : g))
      })),

      addFuneralCase: (fCase) => set((state) => ({
        funeralCases: [...state.funeralCases, { ...fCase, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),
      updateFuneralCase: (id, fCase) => set((state) => ({
        funeralCases: state.funeralCases.map((c) => (c.id === id ? { ...c, ...fCase } : c))
      })),

      addFuneralContribution: (contribution) => set((state) => ({
        funeralContributions: [...state.funeralContributions, { ...contribution, id: crypto.randomUUID() }]
      })),
      addFuneralExpense: (expense) => set((state) => ({
        funeralExpenses: [...state.funeralExpenses, { ...expense, id: crypto.randomUUID() }]
      })),
      addFuneralTask: (task) => set((state) => ({
        funeralTasks: [...state.funeralTasks, { ...task, id: crypto.randomUUID() }]
      })),
      updateFuneralTask: (id, task) => set((state) => ({
        funeralTasks: state.funeralTasks.map((t) => (t.id === id ? { ...t, ...task } : t))
      })),
      addFuneralMessage: (message) => set((state) => ({
        funeralMessages: [...state.funeralMessages, { ...message, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),

      addChurchProject: (project) => set((state) => ({
        churchProjects: [...state.churchProjects, { ...project, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),
      updateChurchProject: (id, project) => set((state) => ({
        churchProjects: state.churchProjects.map((p) => (p.id === id ? { ...p, ...project } : p))
      })),
      deleteChurchProject: (id) => set((state) => ({
        churchProjects: state.churchProjects.filter((p) => p.id !== id)
      })),

      addProjectContribution: (contribution) => set((state) => ({
        projectContributions: [...state.projectContributions, { ...contribution, id: crypto.randomUUID() }]
      })),
      addProjectExpense: (expense) => set((state) => ({
        projectExpenses: [...state.projectExpenses, { ...expense, id: crypto.randomUUID() }]
      })),
      addProjectStep: (step) => set((state) => ({
        projectSteps: [...state.projectSteps, { ...step, id: crypto.randomUUID() }]
      })),
      updateProjectStep: (id, step) => set((state) => ({
        projectSteps: state.projectSteps.map((s) => (s.id === id ? { ...s, ...step } : s))
      })),
      addProjectMedia: (media) => set((state) => ({
        projectMedia: [...state.projectMedia, { ...media, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),

      addAssignment: (assignment) => set((state) => ({
        assignments: [...state.assignments, { ...assignment, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),
      updateAssignment: (id, assignment) => set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...assignment } : a))
      })),
      deleteAssignment: (id) => set((state) => ({
        assignments: state.assignments.filter((a) => a.id !== id)
      })),

      addAssignmentMember: (am) => set((state) => ({
        assignmentMembers: [...state.assignmentMembers, { ...am, id: crypto.randomUUID() }]
      })),
      updateAssignmentMember: (id, am) => set((state) => ({
        assignmentMembers: state.assignmentMembers.map((m) => (m.id === id ? { ...m, ...am } : m))
      })),
      deleteAssignmentMember: (id) => set((state) => ({
        assignmentMembers: state.assignmentMembers.filter((m) => m.id !== id)
      })),

      updateMemberAvailability: (availability) => set((state) => {
        const existing = state.memberAvailabilities.find(a => a.memberId === availability.memberId && a.dayOfWeek === availability.dayOfWeek);
        if (existing) {
          return {
            memberAvailabilities: state.memberAvailabilities.map(a => a.id === existing.id ? { ...a, ...availability } : a)
          };
        }
        return {
          memberAvailabilities: [...state.memberAvailabilities, { ...availability, id: crypto.randomUUID() }]
        };
      }),

      addCourse: (course) => set((state) => ({
        courses: [...state.courses, { ...course, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),
      updateCourse: (id, course) => set((state) => ({
        courses: state.courses.map((c) => (c.id === id ? { ...c, ...course } : c))
      })),
      deleteCourse: (id) => set((state) => ({
        courses: state.courses.filter((c) => c.id !== id)
      })),

      addCourseModule: (module) => set((state) => ({
        courseModules: [...state.courseModules, { ...module, id: crypto.randomUUID() }]
      })),
      updateCourseModule: (id, module) => set((state) => ({
        courseModules: state.courseModules.map(m => m.id === id ? { ...m, ...module } : m)
      })),
      deleteCourseModule: (id) => set((state) => ({
        courseModules: state.courseModules.filter(m => m.id !== id),
        courseLessons: state.courseLessons.filter(l => l.moduleId !== id)
      })),
      addCourseLesson: (lesson) => set((state) => ({
        courseLessons: [...state.courseLessons, { ...lesson, id: crypto.randomUUID() }]
      })),
      updateCourseLesson: (id, lesson) => set((state) => ({
        courseLessons: state.courseLessons.map(l => l.id === id ? { ...l, ...lesson } : l)
      })),
      deleteCourseLesson: (id) => set((state) => ({
        courseLessons: state.courseLessons.filter(l => l.id !== id)
      })),

      enrollMember: (courseId, memberId) => set((state) => ({
        courseEnrollments: [...state.courseEnrollments, {
          id: crypto.randomUUID(),
          courseId,
          memberId,
          progress: 0,
          status: 'enrolled',
          enrolledAt: new Date().toISOString(),
          completedLessons: []
        }]
      })),

      updateProgress: (enrollmentId, lessonId) => set((state) => {
        const enrollment = state.courseEnrollments.find(e => e.id === enrollmentId);
        if (!enrollment || enrollment.completedLessons.includes(lessonId)) return state;
        
        const newCompleted = [...enrollment.completedLessons, lessonId];
        const courseLessons = state.courseLessons.filter(l => {
          const module = state.courseModules.find(m => m.id === l.moduleId);
          return module?.courseId === enrollment.courseId;
        });
        
        const progress = (newCompleted.length / courseLessons.length) * 100;
        
        return {
          courseEnrollments: state.courseEnrollments.map(e => e.id === enrollmentId ? {
            ...e,
            completedLessons: newCompleted,
            progress,
            status: progress === 100 ? 'completed' : 'enrolled',
            completedAt: progress === 100 ? new Date().toISOString() : undefined
          } : e)
        };
      }),

      updateCourseEnrollment: (id, enrollment) => set((state) => ({
        courseEnrollments: state.courseEnrollments.map(e => e.id === id ? { ...e, ...enrollment } : e)
      })),

      addCourseQuiz: (quiz) => set((state) => ({
        courseQuizzes: [...state.courseQuizzes, { ...quiz, id: crypto.randomUUID() }]
      })),
      addCourseResource: (resource) => set((state) => ({
        courseResources: [...state.courseResources, { ...resource, id: crypto.randomUUID() }]
      })),

      addCourseSubject: (subject) => set((state) => ({
        courseSubjects: [...state.courseSubjects, { ...subject, id: crypto.randomUUID() }]
      })),
      deleteCourseSubject: (id) => set((state) => ({
        courseSubjects: state.courseSubjects.filter(s => s.id !== id),
        courseGrades: state.courseGrades.filter(g => g.subjectId !== id)
      })),
      addCourseGrade: (grade) => set((state) => ({
        courseGrades: [...state.courseGrades, { ...grade, id: crypto.randomUUID() }]
      })),
      updateCourseGrade: (id, grade) => set((state) => ({
        courseGrades: state.courseGrades.map(g => g.id === id ? { ...g, ...grade } : g)
      })),

      addDocumentFolder: (folder) => set((state) => ({
        documentFolders: [...state.documentFolders, { ...folder, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),
      updateDocumentFolder: (id, folder) => set((state) => ({
        documentFolders: state.documentFolders.map((f) => (f.id === id ? { ...f, ...folder } : f))
      })),
      deleteDocumentFolder: (id) => set((state) => ({
        documentFolders: state.documentFolders.filter((f) => f.id !== id)
      })),

      addDocumentFile: (file) => set((state) => ({
        documentFiles: [...state.documentFiles, { 
          ...file, 
          id: crypto.randomUUID(), 
          version: 1,
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString() 
        }]
      })),
      updateDocumentFile: (id, file) => set((state) => ({
        documentFiles: state.documentFiles.map((f) => (f.id === id ? { ...f, ...file, updatedAt: new Date().toISOString() } : f))
      })),
      deleteDocumentFile: (id) => set((state) => ({
        documentFiles: state.documentFiles.filter((f) => f.id !== id)
      })),
      toggleFavoriteDocument: (id) => set((state) => ({
        documentFiles: state.documentFiles.map((f) => (f.id === id ? { ...f, isFavorite: !f.isFavorite } : f))
      })),
      
      auditLogs: [
        { id: '1', userId: '1', userName: 'Jean Koffi', action: 'Connexion', target: 'Système', timestamp: '2026-04-08T10:00:00Z' },
        { id: '2', userId: '1', userName: 'Jean Koffi', action: 'Création', target: 'Nouveau Membre', details: 'Ajout de Awa Coulibaly', timestamp: '2026-04-08T10:15:00Z' },
      ],
      addUser: (user) => set((state) => ({
        users: [...state.users, { ...user, id: crypto.randomUUID(), status: 'active', createdAt: new Date().toISOString() }]
      })),
      updateUser: (id, user) => set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, ...user } : u))
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter((u) => u.id !== id)
      })),
      addAuditLog: (log) => set((state) => ({
        auditLogs: [{ ...log, id: crypto.randomUUID(), timestamp: new Date().toISOString() }, ...state.auditLogs].slice(0, 100)
      })),
      
      conversations: [
        { id: '1', type: 'group', name: 'Conseil Pastoral', participants: ['1', '2', '3'], churchId: '1', metadata: { type: 'general' }, lastMessageId: '1' },
        { id: '2', type: 'group', name: 'Département Louange', participants: ['1', '4'], churchId: '1', metadata: { type: 'department', id: '1' }, lastMessageId: '2' },
        { id: '3', type: 'individual', participants: ['1', '2'], churchId: '1', lastMessageId: '3' },
      ],
      messages: [
        { id: '1', conversationId: '1', senderId: '1', content: 'Bonjour à tous, la réunion de demain est confirmée à 18h.', timestamp: '2026-04-08T09:00:00Z', readBy: ['1', '2'] },
        { id: '2', conversationId: '2', senderId: '4', content: 'Avons-nous les partitions pour dimanche ?', timestamp: '2026-04-08T10:30:00Z', readBy: ['4'] },
        { id: '3', conversationId: '3', senderId: '2', content: 'Jean, peux-tu valider le rapport financier ?', timestamp: '2026-04-08T11:00:00Z', readBy: ['2'] },
      ],
      addConversation: (conversation) => {
        const id = crypto.randomUUID();
        set((state) => ({
          conversations: [...state.conversations, { ...conversation, id }]
        }));
        return id;
      },
      addMessage: (message) => set((state) => {
        const id = crypto.randomUUID();
        const timestamp = new Date().toISOString();
        return {
          messages: [...state.messages, { ...message, id, timestamp, readBy: [message.senderId] }],
          conversations: state.conversations.map(c => 
            c.id === message.conversationId ? { ...c, lastMessageId: id } : c
          )
        };
      }),
      markAsRead: (conversationId, userId) => set((state) => ({
        messages: state.messages.map(m => 
          m.conversationId === conversationId && !m.readBy.includes(userId)
            ? { ...m, readBy: [...m.readBy, userId] }
            : m
        )
      })),

      announcements: [
        {
          id: '1',
          churchId: '1',
          title: 'Culte Spécial de Pâques',
          description: 'Rejoignez-nous pour un culte exceptionnel célébrant la résurrection.',
          category: 'event',
          status: 'active',
          startDate: '2026-04-12T10:00:00Z',
          endDate: '2026-04-12T13:00:00Z',
          targetAudience: 'all',
          isUrgent: true,
          readBy: ['1', '2'],
          createdAt: '2026-04-01T08:00:00Z',
          imageUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800&q=80',
          actionLink: { label: 'Je participe', url: '/events' }
        },
        {
          id: '2',
          churchId: '1',
          title: 'Formation Nouveaux Disciples',
          description: 'Session de formation pour tous ceux qui souhaitent approfondir leur foi.',
          category: 'training',
          status: 'upcoming',
          startDate: '2026-04-20T18:30:00Z',
          endDate: '2026-04-20T20:30:00Z',
          targetAudience: 'all',
          isUrgent: false,
          readBy: ['1'],
          createdAt: '2026-04-05T10:00:00Z',
          actionLink: { label: 'S\'inscrire', url: '/trainings' }
        }
      ],
      baptisms: [],
      weddings: [],
      addAnnouncement: (announcement) => set((state) => ({
        announcements: [
          { 
            ...announcement, 
            id: crypto.randomUUID(), 
            createdAt: new Date().toISOString(),
            readBy: [] 
          }, 
          ...state.announcements
        ]
      })),
      updateAnnouncement: (id, announcement) => set((state) => ({
        announcements: state.announcements.map(a => a.id === id ? { ...a, ...announcement } : a)
      })),
      deleteAnnouncement: (id) => set((state) => ({
        announcements: state.announcements.filter(a => a.id !== id)
      })),
      markAnnouncementAsRead: (announcementId, userId) => set((state) => ({
        announcements: state.announcements.map(a => 
          a.id === announcementId && !a.readBy.includes(userId)
            ? { ...a, readBy: [...a.readBy, userId] }
            : a
        )
      })),
      addBaptism: (baptism) => set((state) => ({
        baptisms: [...state.baptisms, { ...baptism, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),
      updateBaptism: (id, baptism) => set((state) => ({
        baptisms: state.baptisms.map((b) => b.id === id ? { ...b, ...baptism } : b)
      })),
      deleteBaptism: (id) => set((state) => ({
        baptisms: state.baptisms.filter((b) => b.id !== id)
      })),
      addWedding: (wedding) => set((state) => ({
        weddings: [...state.weddings, { ...wedding, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),
      updateWedding: (id, wedding) => set((state) => ({
        weddings: state.weddings.map((w) => w.id === id ? { ...w, ...wedding } : w)
      })),
      deleteWedding: (id) => set((state) => ({
        weddings: state.weddings.filter((w) => w.id !== id)
      })),
    }),
    {
      name: 'ekklesia-africa-storage-v3',
    }
  )
);
