import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './lib/store';
import { Layout } from './components/Layout';
import { PublicLanding } from './components/PublicLanding';
import { ParcoursPage } from './components/ParcoursPage';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { MemberManagement } from './components/MemberManagement';
import { ChildrenManagement } from './components/ChildrenManagement';
import { DepartmentManagement } from './components/DepartmentManagement';
import { ServiceManagement } from './components/ServiceManagement';
import { FinanceManagement } from './components/FinanceManagement';
import { ContributionsManagement } from './components/ContributionsManagement';
import { FuneralManagement } from './components/FuneralManagement';
import { ProjectManagement } from './components/ProjectManagement';
import { AssignmentManagement } from './components/AssignmentManagement';
import { TrainingManagement } from './components/TrainingManagement';
import { DocumentManagement } from './components/DocumentManagement';
import { StatisticsManagement } from './components/StatisticsManagement';
import { UserManagement } from './components/UserManagement';
import { MessagingManagement } from './components/MessagingManagement';
import { AnnouncementManagement } from './components/AnnouncementManagement';
import { ChurchManagement } from './components/ChurchManagement';
import { EventsManagement } from './components/EventsManagement';
import { CeremonyManagement } from './components/CeremonyManagement';
import { PlaceholderPage } from './components/PlaceholderPage';
import { 
  Layers, 
  Mic2, 
  Coins, 
  HeartHandshake, 
  Building2, 
  ClipboardList, 
  GraduationCap, 
  Mail, 
  Megaphone, 
  FileText, 
  BarChart3, 
  UserCog 
} from 'lucide-react';
import { Toaster } from 'sonner';

import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SuperAdminChurchList } from './components/admin/SuperAdminChurchList';
import { SuperAdminValidationRequests } from './components/admin/SuperAdminValidationRequests';
import { SubscriptionManagement } from './components/admin/SubscriptionManagement';
import { ChurchesPage } from './components/ChurchesPage';
import { ListingsPage } from './components/ListingsPage';

export default function App() {
  const { isAuthenticated, currentUser } = useStore();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          isAuthenticated 
            ? (currentUser?.role === 'super_admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />)
            : <PublicLanding />
        } />
        <Route path="/parcours" element={<ParcoursPage />} />
        <Route path="/eglises" element={<ChurchesPage />} />
        <Route path="/annonces" element={<ListingsPage />} />
        <Route path="/evenements" element={<ListingsPage />} />
        <Route path="/cultes" element={<ListingsPage />} />
        <Route path="/projets" element={<ListingsPage />} />
        <Route path="/formations" element={<ListingsPage />} />
        <Route path="/login" element={<Login />} />

        {/* Super Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            isAuthenticated && currentUser?.role === 'super_admin' ? (
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/churches" element={<SuperAdminChurchList />} />
                  <Route path="/validations" element={<SuperAdminValidationRequests />} />
                  <Route path="/subscriptions" element={<SubscriptionManagement />} />
                  <Route path="/users" element={<div className="p-8 text-center text-slate-500 italic">Utilisateurs plateformes en cours de développement...</div>} />
                  <Route path="/analytics" element={<div className="p-8 text-center text-slate-500 italic">Analytics globaux en cours de développement...</div>} />
                  <Route path="/settings" element={<div className="p-8 text-center text-slate-500 italic">Paramètres plateforme en cours de développement...</div>} />
                </Routes>
              </AdminLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Protected Church Admin Routes */}
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              currentUser?.role === 'super_admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/churches" element={<ChurchManagement />} />
                    
                    {/* Organisation */}
                    <Route path="/organisation/departments" element={<DepartmentManagement />} />
                    <Route path="/organisation/services" element={<ServiceManagement />} />
                    <Route path="/organisation/ceremonies" element={<CeremonyManagement />} />
                    <Route path="/events" element={<EventsManagement />} />
                    
                    {/* Membres */}
                    <Route path="/members" element={<MemberManagement />} />
                    <Route path="/children" element={<ChildrenManagement />} />
                    
                    {/* Finances */}
                    <Route path="/finances" element={<FinanceManagement />} />
                    <Route path="/finances/contributions" element={<ContributionsManagement />} />
                    <Route path="/finances/funeral-fund" element={<FuneralManagement />} />
                    <Route path="/finances/projects" element={<ProjectManagement />} />
                    
                    {/* Autres sections */}
                    <Route path="/assignments" element={<AssignmentManagement />} />
                    <Route path="/trainings" element={<TrainingManagement />} />
                    
                    {/* Communications */}
                    <Route path="/communications/messages" element={<MessagingManagement />} />
                    <Route path="/communications/announcements" element={<AnnouncementManagement />} />
                    
                    <Route path="/documents" element={<DocumentManagement />} />
                    <Route path="/stats" element={<StatisticsManagement />} />
                    <Route path="/users" element={<UserManagement />} />
                    
                    <Route path="/settings" element={<div className="p-8 text-center text-slate-500 italic">Paramètres en cours de développement...</div>} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
      <Toaster position="top-right" richColors />
    </Router>
  );
}
