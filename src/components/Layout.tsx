import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../lib/store';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Church as ChurchIcon,
  Calendar,
  Settings,
  Menu,
  X,
  Bell,
  ChevronDown,
  ChevronRight,
  Baby,
  Briefcase,
  Layers,
  Mic2,
  Coins,
  HeartHandshake,
  Building2,
  ClipboardList,
  GraduationCap,
  MessageSquare,
  Mail,
  Megaphone,
  FileText,
  BarChart3,
  UserCog,
  LogOut,
  Activity,
  Landmark,
  Heart
} from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: 'Tableau de Bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Activités Récentes', href: '/activities', icon: Activity },
  { name: 'Églises', href: '/churches', icon: ChurchIcon },
  { 
    name: 'Organisation', 
    href: '/organisation', 
    icon: Briefcase,
    subItems: [
      { name: 'Départements', href: '/organisation/departments', icon: Layers },
      { name: 'Cultes', href: '/organisation/services', icon: Mic2 },
      { name: 'Événements', href: '/events', icon: Calendar },
      { name: 'Baptêmes & Mariages', href: '/organisation/ceremonies', icon: HeartHandshake },
    ]
  },
  {
    name: 'Membres',
    href: '/members',
    icon: Users,
    subItems: [
      { name: 'Adultes', href: '/members', icon: Users },
      { name: 'Enfants', href: '/children', icon: Baby },
    ]
  },
  { name: 'Suivi Spirituel', href: '/spiritual', icon: Heart },
  {
    name: 'Finances',
    href: '/finances',
    icon: Wallet,
    subItems: [
      { name: "Vue d'ensemble", href: '/finances', icon: BarChart3 },
      { name: 'Cotisations', href: '/finances/contributions', icon: Coins },
      { name: 'Cas de Décès', href: '/finances/funeral-fund', icon: HeartHandshake },
      { name: 'Projets Église', href: '/finances/projects', icon: Building2 },
      { name: 'Caisses', href: '/finances/cash-registers', icon: Landmark },
    ]
  },
  { name: 'Affectations', href: '/assignments', icon: ClipboardList },
  { name: 'Formations', href: '/trainings', icon: GraduationCap },
  { 
    name: 'Communications', 
    href: '/communications', 
    icon: MessageSquare,
    subItems: [
      { name: 'Messagerie', href: '/communications/messages', icon: Mail },
      { name: 'Annonces', href: '/communications/announcements', icon: Megaphone },
    ]
  },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Statistiques', href: '/stats', icon: BarChart3 },
  { name: 'Utilisateurs', href: '/users', icon: UserCog },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const { logout, currentUser } = useStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);
  const [openSubMenu, setOpenSubMenu] = React.useState<string | null>(null);

  // Close sub-menu when navigating to a different top-level item
  React.useEffect(() => {
    const activeItem = navItems.find(item => 
      item.href === location.pathname || 
      (item.subItems && item.subItems.some(sub => sub.href === location.pathname))
    );
    
    if (activeItem && activeItem.subItems) {
      setOpenSubMenu(activeItem.name);
    } else {
      setOpenSubMenu(null);
    }
  }, [location.pathname]);

  const toggleSubMenu = (name: string) => {
    setOpenSubMenu(openSubMenu === name ? null : name);
  };

  const filteredNavItems = React.useMemo(() => {
    if (!currentUser) return [];
    if (!currentUser.tabAccess) return navItems;
    // Always include Tableau de Bord if not explicitly denied, or just check the list
    return navItems.filter(item =>
      item.name === 'Tableau de Bord' ||
      currentUser.tabAccess?.includes(item.name)
    );
  }, [currentUser]);

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-church-dark text-white shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-serif font-bold text-church-gold">Grace-Connect</h1>
          <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Gestion Multi-Églises</p>
        </div>
        <div className="flex-1 overflow-y-auto sidebar-scrollbar px-4 py-4">
          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const hasSubItems = !!item.subItems;
              const isSubMenuOpen = openSubMenu === item.name;
              const isActive = location.pathname === item.href || (item.subItems && item.subItems.some(sub => sub.href === location.pathname));

              if (hasSubItems) {
                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => toggleSubMenu(item.name)}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-200",
                        isActive && !isSubMenuOpen
                          ? "bg-church-gold text-white font-medium shadow-lg shadow-church-gold/20" 
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-church-green")} />
                        {item.name}
                      </div>
                      {isSubMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    
                    {isSubMenuOpen && (
                      <div className="pl-10 space-y-1">
                        {item.subItems?.map((sub) => {
                          const isSubActive = location.pathname === sub.href;
                          return (
                            <Link
                              key={sub.name}
                              to={sub.href}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                isSubActive 
                                  ? "text-church-gold font-medium" 
                                  : "text-white/40 hover:text-white hover:bg-white/5"
                              )}
                            >
                              <sub.icon className="w-4 h-4" />
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-church-gold text-white font-medium shadow-lg shadow-church-gold/20" 
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-church-green")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-church-gold flex items-center justify-center text-white font-bold">
              {currentUser?.firstName[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{currentUser?.firstName} {currentUser?.lastName}</p>
              <p className="text-xs text-white/40 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-white/60 hover:text-white hover:bg-white/5 px-3 py-2.5 h-auto font-normal rounded-xl transition-all duration-200"
            onClick={() => {
              setIsLogoutDialogOpen(true);
            }}
          >
            <LogOut className="w-5 h-5 text-church-green" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              } />
              <SheetContent side="left" className="p-0 w-64 bg-church-dark text-white border-none">
                <div className="p-6">
                  <h1 className="text-2xl font-serif font-bold text-church-gold">Grace-Connect</h1>
                </div>
                <div className="flex-1 overflow-y-auto sidebar-scrollbar px-4">
                  <nav className="space-y-1">
                    {filteredNavItems.map((item) => {
                      const hasSubItems = !!item.subItems;
                      const isSubMenuOpen = openSubMenu === item.name;
                      const isActive = location.pathname === item.href || (item.subItems && item.subItems.some(sub => sub.href === location.pathname));

                      if (hasSubItems) {
                        return (
                          <div key={item.name} className="space-y-1">
                            <button
                              onClick={() => toggleSubMenu(item.name)}
                              className={cn(
                                "flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-200",
                                isActive && !isSubMenuOpen
                                  ? "bg-church-gold text-white font-medium" 
                                  : "text-white/60 hover:bg-white/5 hover:text-white"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-church-green")} />
                                {item.name}
                              </div>
                              {isSubMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            
                            {isSubMenuOpen && (
                              <div className="pl-10 space-y-1">
                                {item.subItems?.map((sub) => {
                                  const isSubActive = location.pathname === sub.href;
                                  return (
                                    <Link
                                      key={sub.name}
                                      to={sub.href}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                        isSubActive 
                                          ? "text-church-gold font-medium" 
                                          : "text-white/40 hover:text-white hover:bg-white/5"
                                      )}
                                    >
                                      <sub.icon className="w-4 h-4" />
                                      {sub.name}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                            isActive 
                              ? "bg-church-gold text-white font-medium" 
                              : "text-white/60 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-church-green")} />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>
                  <div className="mt-8 p-4 border-t border-white/5">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 text-white/60 hover:text-white hover:bg-white/5 px-3 py-2.5 h-auto font-normal rounded-xl transition-all duration-200"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsLogoutDialogOpen(true);
                      }}
                    >
                      <LogOut className="w-5 h-5 text-church-green" />
                      <span>Déconnexion</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <h2 className="text-lg font-medium text-slate-700 hidden md:block">
              {navItems.find(item => item.href === location.pathname)?.name || 'Ekklesia'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 hidden sm:block">Siège Central</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <ChurchIcon className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <LogOut className="w-5 h-5" />
              Confirmation de déconnexion
            </DialogTitle>
            <DialogDescription className="pt-2">
              Êtes-vous sûr de vouloir vous déconnecter de votre espace de gestion ? 
              Toutes les sessions actives seront fermées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsLogoutDialogOpen(false)}
              className="rounded-xl"
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setIsLogoutDialogOpen(false);
                logout();
              }}
              className="rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold"
            >
              Confirmer la déconnexion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
