import { useState, useEffect } from 'react';
import { Church, Users, Heart, Calendar, DollarSign, Bell, LogOut, Menu, X, ChevronRight, Shield } from 'lucide-react';

// ─── API helper ───────────────────────────────────────────────────────────────
const API = '/api';
const apiFetch = async (path: string, opts?: RequestInit) => {
  const token = localStorage.getItem('gc_token');
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts?.headers,
    },
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Erreur serveur');
  return res.json();
};

// ─── Types ────────────────────────────────────────────────────────────────────
type User = { id: number; name: string; email?: string; role: string; churchId?: number };

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (token: string, user: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('gc_token', data.token);
      onLogin(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur rounded-3xl mb-4">
            <Church size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">GraceConnect</h1>
          <p className="text-brand-200 mt-1 text-sm">Gestion d'église intelligente</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Connexion</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="pastor@eglise.com" required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mot de passe</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="••••••••" required
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold text-base hover:bg-brand-700 transition-all disabled:opacity-60"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            GraceConnect — Logiciel de gestion d'église
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const navItems = [
  { id: 'dashboard',      label: 'Tableau de bord',  icon: Church },
  { id: 'members',        label: 'Membres',           icon: Users },
  { id: 'events',         label: 'Événements',        icon: Calendar },
  { id: 'contributions',  label: 'Offrandes & Dîmes', icon: DollarSign },
  { id: 'announcements',  label: 'Annonces',          icon: Bell },
  { id: 'admin',          label: 'Administration',     icon: Shield },
];

function Sidebar({ active, onNav, onLogout, userName, menuOpen, onClose }:
  { active: string; onNav: (id: string) => void; onLogout: () => void; userName: string; menuOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Mobile overlay */}
      {menuOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 flex flex-col z-30 transform transition-transform duration-300
        ${menuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Church size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">GraceConnect</p>
              <p className="text-slate-400 text-xs">{userName}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNav(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700/50">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white text-sm font-medium transition-all">
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const stats = [
    { label: 'Membres actifs',     value: '—', icon: Users,        color: 'bg-blue-500' },
    { label: 'Présences ce mois',  value: '—', icon: Heart,        color: 'bg-brand-500' },
    { label: 'Offrandes du mois',  value: '—', icon: DollarSign,   color: 'bg-gold-500' },
    { label: 'Événements à venir', value: '—', icon: Calendar,     color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 text-sm mt-1">Bienvenue sur GraceConnect</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Coming soon */}
      <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-8 text-center border border-brand-200">
        <Church size={48} className="text-brand-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-brand-800 mb-2">GraceConnect est en cours de configuration</h3>
        <p className="text-brand-600 text-sm max-w-md mx-auto">
          Les modules Membres, Présences, Offrandes, Événements et Annonces sont en cours de développement.
          La structure de base est opérationnelle.
        </p>
      </div>
    </div>
  );
}

// ─── Placeholder views ────────────────────────────────────────────────────────
function PlaceholderView({ title, icon: Icon, description }: { title: string; icon: React.ElementType; description: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">{title}</h1>
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
        <Icon size={48} className="text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-600 mb-2">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('gc_token'));
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    apiFetch('/auth/me')
      .then(u => setUser(u))
      .catch(() => { localStorage.removeItem('gc_token'); setToken(null); })
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogin = (t: string, u: User) => { setToken(t); setUser(u); };
  const handleLogout = () => { localStorage.removeItem('gc_token'); setToken(null); setUser(null); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) return <LoginScreen onLogin={handleLogin} />;

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':     return <Dashboard />;
      case 'members':       return <PlaceholderView title="Membres" icon={Users} description="Gérez les membres de votre église" />;
      case 'events':        return <PlaceholderView title="Événements" icon={Calendar} description="Planifiez cultes et réunions" />;
      case 'contributions': return <PlaceholderView title="Offrandes & Dîmes" icon={DollarSign} description="Suivez les contributions financières" />;
      case 'announcements': return <PlaceholderView title="Annonces" icon={Bell} description="Communiquez avec votre congrégation" />;
      case 'admin':         return <PlaceholderView title="Administration" icon={Shield} description="Paramètres et configuration" />;
      default:              return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        active={activeView} onNav={setActiveView} onLogout={handleLogout}
        userName={user.name || user.email || 'Utilisateur'}
        menuOpen={menuOpen} onClose={() => setMenuOpen(false)}
      />

      {/* Main */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
          <button onClick={() => setMenuOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
            <Menu size={20} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">
              {navItems.find(n => n.id === activeView)?.label || 'GraceConnect'}
            </p>
          </div>
          <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{(user.name || 'U')[0].toUpperCase()}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
