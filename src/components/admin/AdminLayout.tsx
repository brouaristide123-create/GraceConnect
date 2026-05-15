import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active: boolean;
  badge?: number;
  key?: string;
}

function SidebarItem({ icon: Icon, label, href, active, badge }: SidebarItemProps) {
  return (
    <Link to={href}>
      <div className={`
        flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
        ${active 
          ? 'bg-white/10 text-white shadow-lg shadow-black/5' 
          : 'text-white/60 hover:bg-white/5 hover:text-white'}
      `}>
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${active ? 'text-church-gold' : 'group-hover:text-church-gold'} transition-colors`} />
          <span className="font-medium">{label}</span>
        </div>
        {badge !== undefined && badge > 0 && (
          <Badge className="bg-red-500 text-white border-none h-5 px-1.5 min-w-[20px] flex items-center justify-center text-[10px]">
            {badge}
          </Badge>
        )}
      </div>
    </Link>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { logout, currentUser, churches } = useStore();

  const pendingChurches = churches.filter(c => c.status === 'pending').length;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: CheckCircle2, label: 'Validations', href: '/admin/validations', badge: pendingChurches },
    { icon: Building2, label: 'Églises', href: '/admin/churches' },
    { icon: CreditCard, label: 'Abonnements', href: '/admin/subscriptions' },
    { icon: Users, label: 'Utilisateurs', href: '/admin/users' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: Settings, label: 'Paramètres', href: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-church-dark text-white p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-church-gold rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-church-gold/20">
            E
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl leading-tight">Super Admin</span>
            <span className="text-[10px] text-church-gold font-bold uppercase tracking-widest">Plateforme Ekklesia</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto sidebar-scrollbar pr-2">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.href} 
              icon={item.icon}
              label={item.label}
              href={item.href}
              badge={item.badge}
              active={location.pathname === item.href} 
            />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-4 mb-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-church-gold/20 flex items-center justify-center text-church-gold font-bold">
              {currentUser?.firstName[0]}{currentUser?.lastName[0]}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-sm truncate">{currentUser?.firstName} {currentUser?.lastName}</span>
              <span className="text-xs text-white/40 truncate">Super Administrateur</span>
            </div>
          </div>
          <Button 
            className="w-full justify-start bg-red-600 hover:bg-red-700 text-white gap-3 rounded-xl h-12 border-none shadow-lg shadow-red-900/20"
            onClick={() => setIsLogoutDialogOpen(true)}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-church-dark text-white p-6 z-50 lg:hidden"
            >
              {/* same content as desktop sidebar */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-church-gold rounded-xl flex items-center justify-center text-white font-bold text-xl">E</div>
                  <span className="font-serif font-bold text-xl">Super Admin</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <SidebarItem 
                    key={item.href} 
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    badge={item.badge}
                    active={location.pathname === item.href} 
                  />
                ))}
              </nav>
              <div className="mt-auto absolute bottom-6 left-6 right-6 pt-6 border-t border-white/10">
                <Button 
                  className="w-full justify-start bg-red-600 hover:bg-red-700 text-white gap-3 rounded-xl h-12 border-none"
                  onClick={() => setIsLogoutDialogOpen(true)}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Déconnexion</span>
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </Button>
            <div className="relative hidden md:block w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Rechercher une église, un utilisateur..." 
                className="pl-10 bg-slate-50 border-none rounded-xl h-11 w-full focus-visible:ring-church-gold"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full w-10 h-10">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2" />
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-slate-900 leading-none mb-1">{currentUser?.firstName} {currentUser?.lastName}</span>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1.5 h-4 border-none uppercase tracking-tighter">
                Session Active
              </Badge>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden shadow-sm">
              {currentUser?.photoUrl ? (
                <img src={currentUser.photoUrl} alt="profile" className="w-full h-full object-cover" />
              ) : (
                currentUser?.firstName[0]
              )}
            </div>
          </div>
        </header>

        <section className="p-8">
          {children}
        </section>
      </main>

      {/* Logout Confirmation */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[400px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <div className="bg-red-50 p-6 flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <LogOut className="w-8 h-8" />
            </div>
          </div>
          <div className="p-8 text-center">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif font-bold text-center text-slate-900">Déconnexion</DialogTitle>
              <DialogDescription className="text-center text-slate-500 pt-2 text-lg">
                Voulez-vous vraiment vous déconnecter de l'espace Super Admin ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-10 sm:flex-col gap-3">
              <Button 
                variant="destructive" 
                className="w-full h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700"
                onClick={handleLogout}
              >
                Confirmer la déconnexion
              </Button>
              <Button 
                variant="ghost" 
                className="w-full h-12 rounded-xl text-slate-500 font-bold"
                onClick={() => setIsLogoutDialogOpen(false)}
              >
                Annuler
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
