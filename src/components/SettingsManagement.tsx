import React from 'react';
import { useStore, DEFAULT_CHURCH_SETTINGS, ChurchSettings } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from './ui/select';
import { toast } from 'sonner';
import {
  Settings,
  Building2,
  Users,
  Wallet,
  UserCog,
  FileText,
  Bell,
  Shield,
  Archive,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Trash2,
  Plus,
  Eye,
  Smartphone,
  Mail,
  MessageSquare,
  Lock,
  RefreshCw,
  Database,
  Info,
  Pencil,
  X,
  Save,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ── helpers ──────────────────────────────────────────────────────
const CURRENCY_FR: Record<string, string> = {
  XOF: 'FCFA (XOF)', USD: 'Dollar US (USD)', EUR: 'Euro (EUR)', GHS: 'Cedi Ghanéen (GHS)',
};
const TIMEZONE_FR: Record<string, string> = {
  'Africa/Abidjan': 'Abidjan (GMT+0)',
  'Africa/Dakar': 'Dakar (GMT+0)',
  'Africa/Lagos': 'Lagos (GMT+1)',
  'Africa/Douala': 'Douala (GMT+1)',
  'Africa/Nairobi': 'Nairobi (GMT+3)',
  'Europe/Paris': 'Paris (GMT+1/+2)',
};

const MODULE_LIST = [
  'Tableau de Bord', 'Membres', 'Finances', 'Caisses', 'Formations',
  'Événements', 'Départements', 'Communications', 'Documents', 'Statistiques',
];

const DEFAULT_ROLES = [
  { id: 'pasteur', label: 'Pasteur', color: 'bg-purple-100 text-purple-700', description: 'Autorité spirituelle principale' },
  { id: 'tresorier', label: 'Trésorier', color: 'bg-emerald-100 text-emerald-700', description: 'Gestion des finances et des caisses' },
  { id: 'responsable', label: 'Responsable', color: 'bg-blue-100 text-blue-700', description: 'Responsable de département ou de culte' },
  { id: 'secretaire', label: 'Secrétaire', color: 'bg-amber-100 text-amber-700', description: 'Administration et documents' },
  { id: 'intercesseur', label: 'Intercesseur', color: 'bg-rose-100 text-rose-700', description: 'Prière et suivi spirituel' },
];

const FAKE_SESSIONS = [
  { device: 'Chrome / Windows 11', location: 'Abidjan, CI', lastSeen: 'Il y a 2 min', current: true },
  { device: 'Safari / iPhone 14', location: 'Abidjan, CI', lastSeen: 'Il y a 3h', current: false },
  { device: 'Firefox / MacOS', location: 'Paris, FR', lastSeen: 'Il y a 2 jours', current: false },
];

const FAKE_ACTIVITY_LOG = [
  { action: 'Connexion réussie', user: 'Admin', date: new Date(Date.now() - 2 * 60000) },
  { action: 'Caisse créée : Caisse Principale', user: 'Trésorier', date: new Date(Date.now() - 3600000) },
  { action: 'Membre ajouté : Jean Kouadio', user: 'Secrétaire', date: new Date(Date.now() - 7200000) },
  { action: 'Transaction validée : 50 000 FCFA', user: 'Admin', date: new Date(Date.now() - 86400000) },
  { action: 'Rapport exporté (PDF)', user: 'Trésorier', date: new Date(Date.now() - 2 * 86400000) },
];

const FAKE_ARCHIVES = [
  { name: 'Sauvegarde_15-05-2026.zip', size: '4.2 Mo', date: '15/05/2026' },
  { name: 'Sauvegarde_08-05-2026.zip', size: '3.9 Mo', date: '08/05/2026' },
  { name: 'Sauvegarde_01-05-2026.zip', size: '3.7 Mo', date: '01/05/2026' },
];

// ── Toolbar par section ───────────────────────────────────────────
function SectionToolbar({
  editing,
  onEdit,
  onSave,
  onCancel,
}: { editing: boolean; onEdit: () => void; onSave: () => void; onCancel: () => void }) {
  if (!editing) {
    return (
      <div className="flex justify-end">
        <Button
          variant="outline"
          className="gap-2 border-church-green text-church-green hover:bg-church-green/5"
          onClick={onEdit}
        >
          <Pencil className="w-4 h-4" />
          Modifier
        </Button>
      </div>
    );
  }
  return (
    <div className="flex justify-end gap-3">
      <Button variant="outline" className="gap-2 text-slate-600" onClick={onCancel}>
        <X className="w-4 h-4" />
        Annuler
      </Button>
      <Button className="bg-church-gold hover:bg-church-gold/90 text-white gap-2 px-6" onClick={onSave}>
        <Save className="w-4 h-4" />
        Enregistrer
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────

export function SettingsManagement() {
  const { currentUser, churches, updateChurch, churchSettings: stored, updateChurchSettings } = useStore();
  const church = churches.find((c) => c.id === currentUser?.churchId);

  // Valeurs persistées (fallback sur défaut si vieux localStorage sans ce champ)
  const s: ChurchSettings = stored ?? DEFAULT_CHURCH_SETTINGS;

  // ── États locaux (draft de chaque section) ────────────────────
  const [genEdit, setGenEdit] = React.useState(false);
  const [genForm, setGenForm] = React.useState({
    name: church?.name || 'Église de Grâce',
    address: church?.address || '12 Rue de la Paix, Cocody',
    city: church?.city || 'Abidjan',
    country: church?.country || "Côte d'Ivoire",
    slogan: s.slogan,
    primaryColor: s.primaryColor,
    theme: s.theme,
    timezone: s.timezone,
  });

  const [rolesEdit, setRolesEdit] = React.useState(false);
  const [rolePerms, setRolePerms] = React.useState<Record<string, Record<string, boolean>>>(() => {
    if (s.rolePerms && Object.keys(s.rolePerms).length > 0) return s.rolePerms;
    const init: Record<string, Record<string, boolean>> = {};
    DEFAULT_ROLES.forEach(r => {
      init[r.id] = {};
      MODULE_LIST.forEach(m => { init[r.id][m] = r.id === 'pasteur'; });
    });
    return init;
  });
  const [selectedRole, setSelectedRole] = React.useState('pasteur');

  const [finEdit, setFinEdit] = React.useState(false);
  const [finSettings, setFinSettings] = React.useState({
    currency: s.currency,
    mobileMoneyOrange: s.mobileMoneyOrange,
    mobileMoneyMTN: s.mobileMoneyMTN,
    mobileMoneyWave: s.mobileMoneyWave,
    autoReceipt: s.autoReceipt,
    receiptEmail: s.receiptEmail,
    receiptWhatsapp: s.receiptWhatsapp,
    fiscalMonth: s.fiscalMonth,
  });

  const [membEdit, setMembEdit] = React.useState(false);
  const [memberSettings, setMemberSettings] = React.useState({
    matriculeFormat: s.matriculeFormat,
    archiveAfterMonths: s.archiveAfterMonths,
    photoRequired: s.photoRequired,
    birthDateRequired: s.birthDateRequired,
    phoneRequired: s.phoneRequired,
    groupByDepartment: s.groupByDepartment,
  });

  const [docEdit, setDocEdit] = React.useState(false);
  const [docSettings, setDocSettings] = React.useState({
    baptismCert: s.baptismCert,
    marriageCert: s.marriageCert,
    trainingCert: s.trainingCert,
    logoOnDocs: s.logoOnDocs,
    signatureEnabled: s.signatureEnabled,
    headerText: s.headerText,
    footerText: s.footerText,
  });

  const [notifEdit, setNotifEdit] = React.useState(false);
  const [notifInt, setNotifInt] = React.useState({
    newMembers: s.notifNewMembers,
    events: s.notifEvents,
    finances: s.notifFinances,
    urgences: s.notifUrgences,
  });
  const [notifExt, setNotifExt] = React.useState({
    sms: s.notifSms,
    smsProvider: s.notifSmsProvider,
    whatsapp: s.notifWhatsapp,
    email: s.notifEmail,
    smtpServer: s.notifSmtpServer,
  });

  const [secEdit, setSecEdit] = React.useState(false);
  const [secSettings, setSecSettings] = React.useState({
    twoFactor: s.twoFactor,
    maxLoginAttempts: s.maxLoginAttempts,
    sessionTimeout: s.sessionTimeout,
    showActivityLog: s.showActivityLog,
  });

  const [backupEdit, setBackupEdit] = React.useState(false);
  const [backupSettings, setBackupSettings] = React.useState({
    dailyBackup: s.dailyBackup,
    weeklyBackup: s.weeklyBackup,
    backupTime: s.backupTime,
    autoExportPDF: s.autoExportPDF,
    autoExportExcel: s.autoExportExcel,
    retentionMonths: s.retentionMonths,
  });

  // ── Fonctions de réinitialisation (Annuler) ───────────────────
  const resetGen = () => {
    const fresh = stored ?? DEFAULT_CHURCH_SETTINGS;
    setGenForm({
      name: church?.name || 'Église de Grâce',
      address: church?.address || '',
      city: church?.city || '',
      country: church?.country || '',
      slogan: fresh.slogan,
      primaryColor: fresh.primaryColor,
      theme: fresh.theme as 'clair' | 'sombre' | 'auto',
      timezone: fresh.timezone,
    });
    setGenEdit(false);
  };
  const resetRoles = () => {
    const fresh = stored ?? DEFAULT_CHURCH_SETTINGS;
    if (fresh.rolePerms && Object.keys(fresh.rolePerms).length > 0) {
      setRolePerms(fresh.rolePerms);
    }
    setRolesEdit(false);
  };
  const resetFin = () => {
    const fresh = stored ?? DEFAULT_CHURCH_SETTINGS;
    setFinSettings({ currency: fresh.currency, mobileMoneyOrange: fresh.mobileMoneyOrange, mobileMoneyMTN: fresh.mobileMoneyMTN, mobileMoneyWave: fresh.mobileMoneyWave, autoReceipt: fresh.autoReceipt, receiptEmail: fresh.receiptEmail, receiptWhatsapp: fresh.receiptWhatsapp, fiscalMonth: fresh.fiscalMonth });
    setFinEdit(false);
  };
  const resetMemb = () => {
    const fresh = stored ?? DEFAULT_CHURCH_SETTINGS;
    setMemberSettings({ matriculeFormat: fresh.matriculeFormat, archiveAfterMonths: fresh.archiveAfterMonths, photoRequired: fresh.photoRequired, birthDateRequired: fresh.birthDateRequired, phoneRequired: fresh.phoneRequired, groupByDepartment: fresh.groupByDepartment });
    setMembEdit(false);
  };
  const resetDoc = () => {
    const fresh = stored ?? DEFAULT_CHURCH_SETTINGS;
    setDocSettings({ baptismCert: fresh.baptismCert, marriageCert: fresh.marriageCert, trainingCert: fresh.trainingCert, logoOnDocs: fresh.logoOnDocs, signatureEnabled: fresh.signatureEnabled, headerText: fresh.headerText, footerText: fresh.footerText });
    setDocEdit(false);
  };
  const resetNotif = () => {
    const fresh = stored ?? DEFAULT_CHURCH_SETTINGS;
    setNotifInt({ newMembers: fresh.notifNewMembers, events: fresh.notifEvents, finances: fresh.notifFinances, urgences: fresh.notifUrgences });
    setNotifExt({ sms: fresh.notifSms, smsProvider: fresh.notifSmsProvider, whatsapp: fresh.notifWhatsapp, email: fresh.notifEmail, smtpServer: fresh.notifSmtpServer });
    setNotifEdit(false);
  };
  const resetSec = () => {
    const fresh = stored ?? DEFAULT_CHURCH_SETTINGS;
    setSecSettings({ twoFactor: fresh.twoFactor, maxLoginAttempts: fresh.maxLoginAttempts, sessionTimeout: fresh.sessionTimeout, showActivityLog: fresh.showActivityLog });
    setSecEdit(false);
  };
  const resetBackup = () => {
    const fresh = stored ?? DEFAULT_CHURCH_SETTINGS;
    setBackupSettings({ dailyBackup: fresh.dailyBackup, weeklyBackup: fresh.weeklyBackup, backupTime: fresh.backupTime, autoExportPDF: fresh.autoExportPDF, autoExportExcel: fresh.autoExportExcel, retentionMonths: fresh.retentionMonths });
    setBackupEdit(false);
  };

  // ── Fonctions de sauvegarde ────────────────────────────────────
  const saveGen = () => {
    if (!genForm.name.trim()) { toast.error("Le nom de l'église est obligatoire"); return; }
    if (church) {
      updateChurch(church.id, { name: genForm.name, address: genForm.address, city: genForm.city, country: genForm.country });
    }
    updateChurchSettings({ slogan: genForm.slogan, primaryColor: genForm.primaryColor, theme: genForm.theme, timezone: genForm.timezone });
    toast.success('Informations générales enregistrées ✓');
    setGenEdit(false);
  };
  const saveRoles = () => {
    updateChurchSettings({ rolePerms });
    toast.success('Rôles et permissions enregistrés ✓');
    setRolesEdit(false);
  };
  const saveFin = () => {
    updateChurchSettings({ currency: finSettings.currency, fiscalMonth: finSettings.fiscalMonth, mobileMoneyOrange: finSettings.mobileMoneyOrange, mobileMoneyMTN: finSettings.mobileMoneyMTN, mobileMoneyWave: finSettings.mobileMoneyWave, autoReceipt: finSettings.autoReceipt, receiptEmail: finSettings.receiptEmail, receiptWhatsapp: finSettings.receiptWhatsapp });
    toast.success('Paramètres financiers enregistrés ✓');
    setFinEdit(false);
  };
  const saveMemb = () => {
    updateChurchSettings({ matriculeFormat: memberSettings.matriculeFormat, archiveAfterMonths: memberSettings.archiveAfterMonths, photoRequired: memberSettings.photoRequired, birthDateRequired: memberSettings.birthDateRequired, phoneRequired: memberSettings.phoneRequired, groupByDepartment: memberSettings.groupByDepartment });
    toast.success('Paramètres des membres enregistrés ✓');
    setMembEdit(false);
  };
  const saveDoc = () => {
    updateChurchSettings({ baptismCert: docSettings.baptismCert, marriageCert: docSettings.marriageCert, trainingCert: docSettings.trainingCert, logoOnDocs: docSettings.logoOnDocs, signatureEnabled: docSettings.signatureEnabled, headerText: docSettings.headerText, footerText: docSettings.footerText });
    toast.success('Paramètres des documents enregistrés ✓');
    setDocEdit(false);
  };
  const saveNotif = () => {
    updateChurchSettings({ notifNewMembers: notifInt.newMembers, notifEvents: notifInt.events, notifFinances: notifInt.finances, notifUrgences: notifInt.urgences, notifSms: notifExt.sms, notifSmsProvider: notifExt.smsProvider, notifWhatsapp: notifExt.whatsapp, notifEmail: notifExt.email, notifSmtpServer: notifExt.smtpServer });
    toast.success('Paramètres de notifications enregistrés ✓');
    setNotifEdit(false);
  };
  const saveSec = () => {
    updateChurchSettings({ twoFactor: secSettings.twoFactor, maxLoginAttempts: secSettings.maxLoginAttempts, sessionTimeout: secSettings.sessionTimeout, showActivityLog: secSettings.showActivityLog });
    toast.success('Paramètres de sécurité enregistrés ✓');
    setSecEdit(false);
  };
  const saveBackup = () => {
    updateChurchSettings({ dailyBackup: backupSettings.dailyBackup, weeklyBackup: backupSettings.weeklyBackup, backupTime: backupSettings.backupTime, autoExportPDF: backupSettings.autoExportPDF, autoExportExcel: backupSettings.autoExportExcel, retentionMonths: backupSettings.retentionMonths });
    toast.success('Paramètres de sauvegarde enregistrés ✓');
    setBackupEdit(false);
  };

  // ── Helpers de rendu : champ en lecture seule vs modifiable ───
  const RO = ({ value, placeholder }: { value: string; placeholder?: string }) => (
    <div className="px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 text-sm text-slate-700 min-h-[36px]">
      {value || <span className="text-slate-400 italic">{placeholder || '—'}</span>}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-church-gold" />
          Paramètres
        </h1>
        <p className="text-slate-500 mt-1">Configuration complète de votre espace de gestion.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-slate-100 p-1 flex-wrap h-auto gap-1 inline-flex min-w-max">
            <TabsTrigger value="general" className="data-[state=active]:bg-white gap-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5" />Général
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-white gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />Utilisateurs & Rôles
            </TabsTrigger>
            <TabsTrigger value="finance" className="data-[state=active]:bg-white gap-1.5 text-xs">
              <Wallet className="w-3.5 h-3.5" />Finances
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-white gap-1.5 text-xs">
              <UserCog className="w-3.5 h-3.5" />Membres
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-white gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5" />Documents
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white gap-1.5 text-xs">
              <Bell className="w-3.5 h-3.5" />Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white gap-1.5 text-xs">
              <Shield className="w-3.5 h-3.5" />Sécurité
            </TabsTrigger>
            <TabsTrigger value="backup" className="data-[state=active]:bg-white gap-1.5 text-xs">
              <Archive className="w-3.5 h-3.5" />Sauvegardes
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ══════════════════════════════════════════════════════════
            1. INFORMATIONS GÉNÉRALES
        ══════════════════════════════════════════════════════════ */}
        <TabsContent value="general" className="space-y-6">
          {/* Logo */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-church-gold" />
                Logo & Identité Visuelle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-church-green to-emerald-700 flex items-center justify-center text-white text-3xl font-serif font-bold shadow-md">
                  G
                </div>
                <div className="space-y-2">
                  {genEdit && (
                    <Button variant="outline" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Changer le logo
                    </Button>
                  )}
                  <p className="text-xs text-slate-400">PNG, JPG ou SVG · Max 2 Mo · Recommandé : 512×512px</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Infos de base */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Informations de l'Église</CardTitle>
              <CardDescription>Ces informations apparaissent sur les documents officiels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de l'église *</Label>
                  {genEdit
                    ? <Input value={genForm.name} onChange={e => setGenForm(p => ({...p, name: e.target.value}))} />
                    : <RO value={genForm.name} />}
                </div>
                <div className="space-y-2">
                  <Label>Slogan / Devise</Label>
                  {genEdit
                    ? <Input value={genForm.slogan} onChange={e => setGenForm(p => ({...p, slogan: e.target.value}))} placeholder="Ex: Grandir ensemble dans la foi" />
                    : <RO value={genForm.slogan} placeholder="Non défini" />}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                {genEdit
                  ? <Input value={genForm.address} onChange={e => setGenForm(p => ({...p, address: e.target.value}))} />
                  : <RO value={genForm.address} />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ville</Label>
                  {genEdit
                    ? <Input value={genForm.city} onChange={e => setGenForm(p => ({...p, city: e.target.value}))} />
                    : <RO value={genForm.city} />}
                </div>
                <div className="space-y-2">
                  <Label>Pays</Label>
                  {genEdit
                    ? <Input value={genForm.country} onChange={e => setGenForm(p => ({...p, country: e.target.value}))} />
                    : <RO value={genForm.country} />}
                </div>
              </div>

              {/* Code église & Abonnement (toujours read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Code Église <Info className="w-3 h-3 text-slate-400" />
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input value="GRC-2024-0001" disabled className="bg-slate-50 font-mono text-sm" />
                    <Badge className="bg-emerald-100 text-emerald-700 border-none shrink-0">Actif</Badge>
                  </div>
                  <p className="text-xs text-slate-400">Identifiant unique de votre église — non modifiable.</p>
                </div>
                <div className="space-y-2">
                  <Label>Plan d'abonnement</Label>
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-church-gold/30 bg-church-gold/5">
                    <CheckCircle2 className="w-5 h-5 text-church-gold shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Plan Pro</p>
                      <p className="text-xs text-slate-500">Renouvellement le 01/01/2027</p>
                    </div>
                    <Button size="sm" variant="outline" className="ml-auto text-xs">Gérer</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Couleur & Thème */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Couleurs & Thème</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Couleur principale</Label>
                {genEdit ? (
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={genForm.primaryColor}
                      onChange={e => setGenForm(p => ({...p, primaryColor: e.target.value}))}
                      className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <Input value={genForm.primaryColor} onChange={e => setGenForm(p => ({...p, primaryColor: e.target.value}))} className="w-36 font-mono text-sm" />
                    <div className="flex gap-2">
                      {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'].map(c => (
                        <button
                          key={c}
                          className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                          style={{backgroundColor: c, borderColor: genForm.primaryColor === c ? '#0f172a' : 'transparent'}}
                          onClick={() => setGenForm(p => ({...p, primaryColor: c}))}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-slate-200" style={{backgroundColor: genForm.primaryColor}} />
                    <span className="font-mono text-sm text-slate-700">{genForm.primaryColor}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Thème d'interface</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {val: 'clair', label: 'Clair', icon: '☀️'},
                    {val: 'sombre', label: 'Sombre', icon: '🌙'},
                    {val: 'auto', label: 'Auto (système)', icon: '⚙️'},
                  ].map(t => (
                    <button
                      key={t.val}
                      disabled={!genEdit}
                      onClick={() => setGenForm(p => ({...p, theme: t.val as 'clair' | 'sombre' | 'auto'}))}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium",
                        genForm.theme === t.val ? "border-church-green bg-church-green/5 text-church-green" : "border-slate-200 text-slate-600",
                        genEdit && "hover:border-slate-300 cursor-pointer",
                        !genEdit && "cursor-default"
                      )}
                    >
                      <span className="text-2xl">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fuseau horaire</Label>
                {genEdit ? (
                  <Select value={genForm.timezone} onValueChange={v => setGenForm(p => ({...p, timezone: v}))}>
                    <SelectTrigger>
                      <span className="text-sm">{TIMEZONE_FR[genForm.timezone] || genForm.timezone}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIMEZONE_FR).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <RO value={TIMEZONE_FR[genForm.timezone] || genForm.timezone} />
                )}
              </div>
            </CardContent>
          </Card>

          <SectionToolbar editing={genEdit} onEdit={() => setGenEdit(true)} onSave={saveGen} onCancel={resetGen} />
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════
            2. UTILISATEURS & RÔLES
        ══════════════════════════════════════════════════════════ */}
        <TabsContent value="roles" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-church-gold" />
                    Rôles Personnalisés
                  </CardTitle>
                  <CardDescription>Définissez les accès de chaque rôle au sein de l'église.</CardDescription>
                </div>
                {rolesEdit && (
                  <Button size="sm" className="bg-church-green text-white gap-1">
                    <Plus className="w-3.5 h-3.5" />Nouveau rôle
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-6">
                {DEFAULT_ROLES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                      selectedRole === r.id ? "border-church-green bg-church-green/10 text-church-green" : "border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {(() => {
                const role = DEFAULT_ROLES.find(r => r.id === selectedRole);
                if (!role) return null;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <Badge className={cn("text-sm px-3 py-1 border-none font-semibold", role.color)}>{role.label}</Badge>
                      <p className="text-sm text-slate-600">{role.description}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400 mb-3">Accès aux modules</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {MODULE_LIST.map(mod => (
                          <div key={mod} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                            <span className="text-sm text-slate-700">{mod}</span>
                            <Switch
                              disabled={!rolesEdit}
                              checked={rolePerms[selectedRole]?.[mod] ?? false}
                              onCheckedChange={v => rolesEdit && setRolePerms(p => ({
                                ...p,
                                [selectedRole]: { ...p[selectedRole], [mod]: v }
                              }))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Sessions connectées */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Sessions Connectées</CardTitle>
              <CardDescription>Appareils actuellement connectés à votre compte.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {FAKE_SESSIONS.map((sess, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", sess.current ? "bg-emerald-500" : "bg-slate-300")} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{sess.device}</p>
                      <p className="text-xs text-slate-400">{sess.location} · {sess.lastSeen}</p>
                    </div>
                  </div>
                  {sess.current
                    ? <Badge className="bg-emerald-100 text-emerald-700 border-none text-xs">Session actuelle</Badge>
                    : <Button size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs">Révoquer</Button>
                  }
                </div>
              ))}
              <Button variant="outline" className="w-full text-rose-600 border-rose-200 hover:bg-rose-50">
                Révoquer toutes les autres sessions
              </Button>
            </CardContent>
          </Card>

          <SectionToolbar editing={rolesEdit} onEdit={() => setRolesEdit(true)} onSave={saveRoles} onCancel={resetRoles} />
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════
            3. PARAMÈTRES FINANCIERS
        ══════════════════════════════════════════════════════════ */}
        <TabsContent value="finance" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="w-4 h-4 text-church-gold" />
                Devise & Monnaie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Devise principale</Label>
                {finEdit ? (
                  <Select value={finSettings.currency} onValueChange={v => setFinSettings(p => ({...p, currency: v}))}>
                    <SelectTrigger>
                      <span className="text-sm">{CURRENCY_FR[finSettings.currency] || finSettings.currency}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CURRENCY_FR).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <RO value={CURRENCY_FR[finSettings.currency] || finSettings.currency} />
                )}
              </div>
              <div className="space-y-2">
                <Label>Mois de début d'exercice fiscal</Label>
                {finEdit ? (
                  <Select value={finSettings.fiscalMonth} onValueChange={v => setFinSettings(p => ({...p, fiscalMonth: v}))}>
                    <SelectTrigger>
                      <span className="text-sm">
                        {['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'][parseInt(finSettings.fiscalMonth) - 1]}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'].map((m, i) => (
                        <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <RO value={['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'][parseInt(finSettings.fiscalMonth) - 1]} />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Moyens de Paiement Mobile Money</CardTitle>
              <CardDescription>Activez les opérateurs acceptés par votre église.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'mobileMoneyOrange', label: 'Orange Money', desc: 'CI · SN · ML · BF · CM', emoji: '🟠' },
                { key: 'mobileMoneyMTN', label: 'MTN Mobile Money', desc: 'CI · GH · CM · RW', emoji: '🟡' },
                { key: 'mobileMoneyWave', label: 'Wave', desc: 'CI · SN · BF · ML', emoji: '🌊' },
              ].map(op => (
                <div key={op.key} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{op.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{op.label}</p>
                      <p className="text-xs text-slate-400">{op.desc}</p>
                    </div>
                  </div>
                  <Switch
                    disabled={!finEdit}
                    checked={finSettings[op.key as keyof typeof finSettings] as boolean}
                    onCheckedChange={v => finEdit && setFinSettings(p => ({...p, [op.key]: v}))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Reçus Automatiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'autoReceipt', label: 'Générer un reçu à chaque transaction', desc: 'Reçu PDF automatiquement créé' },
                { key: 'receiptEmail', label: 'Envoyer le reçu par email', desc: "Si l'email du membre est renseigné" },
                { key: 'receiptWhatsapp', label: 'Envoyer le reçu par WhatsApp', desc: 'Si le numéro WhatsApp est renseigné' },
              ].map(opt => (
                <div key={opt.key} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{opt.label}</p>
                    <p className="text-xs text-slate-400">{opt.desc}</p>
                  </div>
                  <Switch
                    disabled={!finEdit}
                    checked={finSettings[opt.key as keyof typeof finSettings] as boolean}
                    onCheckedChange={v => finEdit && setFinSettings(p => ({...p, [opt.key]: v}))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <SectionToolbar editing={finEdit} onEdit={() => setFinEdit(true)} onSave={saveFin} onCancel={resetFin} />
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════
            4. PARAMÈTRES DES MEMBRES
        ══════════════════════════════════════════════════════════ */}
        <TabsContent value="members" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCog className="w-4 h-4 text-church-gold" />
                Format du Matricule
              </CardTitle>
              <CardDescription>Définissez le format automatique des numéros de membre.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Modèle de matricule</Label>
                {membEdit
                  ? <Input value={memberSettings.matriculeFormat} onChange={e => setMemberSettings(p => ({...p, matriculeFormat: e.target.value}))} className="font-mono" />
                  : <RO value={memberSettings.matriculeFormat} />}
                <p className="text-xs text-slate-400">
                  Variables : <code className="bg-slate-100 px-1 rounded">{'{YEAR}'}</code> <code className="bg-slate-100 px-1 rounded">{'{SEQ}'}</code> <code className="bg-slate-100 px-1 rounded">{'{CHURCH}'}</code>
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <p className="text-xs text-slate-600">
                  Exemple : <strong className="font-mono">MBR-2026-0042</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Règles d'Archivage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Archiver automatiquement après (mois d'inactivité)</Label>
                <div className="flex items-center gap-3">
                  {membEdit
                    ? <Input type="number" min="1" max="60" value={memberSettings.archiveAfterMonths} onChange={e => setMemberSettings(p => ({...p, archiveAfterMonths: e.target.value}))} className="w-24" />
                    : <RO value={`${memberSettings.archiveAfterMonths} mois`} />}
                  {membEdit && <span className="text-sm text-slate-500">mois sans activité enregistrée</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Champs Obligatoires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'photoRequired', label: 'Photo de profil obligatoire', desc: "Le membre doit fournir une photo lors de l'inscription" },
                { key: 'birthDateRequired', label: 'Date de naissance obligatoire', desc: '' },
                { key: 'phoneRequired', label: 'Numéro de téléphone obligatoire', desc: '' },
                { key: 'groupByDepartment', label: 'Regrouper les membres par département', desc: 'Affiche les membres organisés par département dans les listes' },
              ].map(opt => (
                <div key={opt.key} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{opt.label}</p>
                    {opt.desc && <p className="text-xs text-slate-400">{opt.desc}</p>}
                  </div>
                  <Switch
                    disabled={!membEdit}
                    checked={memberSettings[opt.key as keyof typeof memberSettings] as boolean}
                    onCheckedChange={v => membEdit && setMemberSettings(p => ({...p, [opt.key]: v}))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <SectionToolbar editing={membEdit} onEdit={() => setMembEdit(true)} onSave={saveMemb} onCancel={resetMemb} />
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════
            5. PARAMÈTRES DES DOCUMENTS
        ══════════════════════════════════════════════════════════ */}
        <TabsContent value="documents" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-church-gold" />
                Certificats Disponibles
              </CardTitle>
              <CardDescription>Activez les types de certificats que votre église émet.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'baptismCert', label: 'Certificat de Baptême', icon: '✝️', desc: 'Attestation officielle de baptême' },
                { key: 'marriageCert', label: 'Certificat de Mariage', icon: '💍', desc: 'Attestation officielle de mariage béni' },
                { key: 'trainingCert', label: 'Certificat de Formation', icon: '🎓', desc: 'Attestation de fin de formation ou de module' },
              ].map(c => (
                <div key={c.key} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{c.label}</p>
                      <p className="text-xs text-slate-400">{c.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="ghost" className="text-xs text-slate-500">
                      <Eye className="w-3.5 h-3.5 mr-1" />Aperçu
                    </Button>
                    <Switch
                      disabled={!docEdit}
                      checked={docSettings[c.key as keyof typeof docSettings] as boolean}
                      onCheckedChange={v => docEdit && setDocSettings(p => ({...p, [c.key]: v}))}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">En-tête & Pied de page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Texte d'en-tête</Label>
                {docEdit
                  ? <Input value={docSettings.headerText} onChange={e => setDocSettings(p => ({...p, headerText: e.target.value}))} placeholder="Ex: Église de Grâce — Abidjan" />
                  : <RO value={docSettings.headerText} placeholder="Non défini" />}
              </div>
              <div className="space-y-2">
                <Label>Texte de pied de page</Label>
                {docEdit
                  ? <Input value={docSettings.footerText} onChange={e => setDocSettings(p => ({...p, footerText: e.target.value}))} placeholder="Ex: Document officiel — Ne pas modifier" />
                  : <RO value={docSettings.footerText} placeholder="Non défini" />}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Identité Visuelle des Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">Logo sur les documents</p>
                  <p className="text-xs text-slate-400">Le logo de l'église apparaît en haut de chaque document imprimé</p>
                </div>
                <Switch disabled={!docEdit} checked={docSettings.logoOnDocs} onCheckedChange={v => docEdit && setDocSettings(p => ({...p, logoOnDocs: v}))} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">Signature du responsable</p>
                  <p className="text-xs text-slate-400">Appose une signature numérique en bas des certificats</p>
                </div>
                <div className="flex items-center gap-3">
                  {docSettings.signatureEnabled && docEdit && (
                    <Button size="sm" variant="outline" className="text-xs gap-1">
                      <Upload className="w-3 h-3" />Uploader
                    </Button>
                  )}
                  <Switch disabled={!docEdit} checked={docSettings.signatureEnabled} onCheckedChange={v => docEdit && setDocSettings(p => ({...p, signatureEnabled: v}))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <SectionToolbar editing={docEdit} onEdit={() => setDocEdit(true)} onSave={saveDoc} onCancel={resetDoc} />
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════
            6. NOTIFICATIONS
        ══════════════════════════════════════════════════════════ */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-church-gold" />
                Notifications Internes
              </CardTitle>
              <CardDescription>Alertes visibles dans l'interface de l'application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'newMembers', label: 'Nouveaux membres', desc: 'Notifié lors de chaque nouvelle inscription de membre' },
                { key: 'events', label: 'Événements', desc: 'Rappels avant les événements et cultes programmés' },
                { key: 'finances', label: 'Finances', desc: "Alertes de transactions, seuils d'alerte de caisse, validations" },
                { key: 'urgences', label: 'Urgences', desc: 'Notifications critiques : sécurité, accès, erreurs système' },
              ].map(opt => (
                <div key={opt.key} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{opt.label}</p>
                    <p className="text-xs text-slate-400">{opt.desc}</p>
                  </div>
                  <Switch
                    disabled={!notifEdit}
                    checked={notifInt[opt.key as keyof typeof notifInt]}
                    onCheckedChange={v => notifEdit && setNotifInt(p => ({...p, [opt.key]: v}))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Notifications Externes</CardTitle>
              <CardDescription>Envoi de notifications aux membres via SMS, WhatsApp ou Email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SMS */}
              <div className="p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    <p className="text-sm font-medium text-slate-900">SMS</p>
                  </div>
                  <Switch disabled={!notifEdit} checked={notifExt.sms} onCheckedChange={v => notifEdit && setNotifExt(p => ({...p, sms: v}))} />
                </div>
                {notifExt.sms && (
                  <div className="space-y-2 pt-1">
                    <Label className="text-xs">Fournisseur SMS (API Key)</Label>
                    {notifEdit
                      ? <Input placeholder="Ex: Twilio, Orange SMS API..." value={notifExt.smsProvider} onChange={e => setNotifExt(p => ({...p, smsProvider: e.target.value}))} />
                      : <RO value={notifExt.smsProvider} placeholder="Non configuré" />}
                  </div>
                )}
              </div>

              {/* WhatsApp */}
              <div className="p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <p className="text-sm font-medium text-slate-900">WhatsApp Business</p>
                    <Badge className="bg-amber-100 text-amber-700 border-none text-xs">Bêta</Badge>
                  </div>
                  <Switch disabled={!notifEdit} checked={notifExt.whatsapp} onCheckedChange={v => notifEdit && setNotifExt(p => ({...p, whatsapp: v}))} />
                </div>
              </div>

              {/* Email */}
              <div className="p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <p className="text-sm font-medium text-slate-900">Email</p>
                  </div>
                  <Switch disabled={!notifEdit} checked={notifExt.email} onCheckedChange={v => notifEdit && setNotifExt(p => ({...p, email: v}))} />
                </div>
                {notifExt.email && (
                  <div className="space-y-2 pt-1">
                    <Label className="text-xs">Serveur SMTP</Label>
                    {notifEdit
                      ? <Input placeholder="smtp.gmail.com" value={notifExt.smtpServer} onChange={e => setNotifExt(p => ({...p, smtpServer: e.target.value}))} />
                      : <RO value={notifExt.smtpServer} placeholder="Non configuré" />}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <SectionToolbar editing={notifEdit} onEdit={() => setNotifEdit(true)} onSave={saveNotif} onCancel={resetNotif} />
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════
            7. SÉCURITÉ
        ══════════════════════════════════════════════════════════ */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-church-gold" />
                Authentification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    Double authentification (2FA)
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Sécurisez les connexions avec un code OTP par SMS ou email</p>
                </div>
                <Switch disabled={!secEdit} checked={secSettings.twoFactor} onCheckedChange={v => secEdit && setSecSettings(p => ({...p, twoFactor: v}))} />
              </div>

              <div className="space-y-2">
                <Label>Tentatives de connexion avant blocage</Label>
                {secEdit
                  ? (
                    <div className="flex items-center gap-3">
                      <Input type="number" min="1" max="20" value={secSettings.maxLoginAttempts} onChange={e => setSecSettings(p => ({...p, maxLoginAttempts: e.target.value}))} className="w-24" />
                      <span className="text-sm text-slate-500">tentatives échouées avant blocage temporaire</span>
                    </div>
                  )
                  : <RO value={`${secSettings.maxLoginAttempts} tentatives`} />}
              </div>

              <div className="space-y-2">
                <Label>Expiration de session (minutes d'inactivité)</Label>
                {secEdit
                  ? (
                    <div className="flex items-center gap-3">
                      <Input type="number" min="5" max="1440" value={secSettings.sessionTimeout} onChange={e => setSecSettings(p => ({...p, sessionTimeout: e.target.value}))} className="w-24" />
                      <span className="text-sm text-slate-500">minutes</span>
                    </div>
                  )
                  : <RO value={`${secSettings.sessionTimeout} minutes`} />}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Journal d'Activité</CardTitle>
                <Switch
                  disabled={!secEdit}
                  checked={secSettings.showActivityLog}
                  onCheckedChange={v => secEdit && setSecSettings(p => ({...p, showActivityLog: v}))}
                />
              </div>
              <CardDescription>Historique des actions importantes effectuées sur la plateforme.</CardDescription>
            </CardHeader>
            {secSettings.showActivityLog && (
              <CardContent>
                <div className="space-y-2">
                  {FAKE_ACTIVITY_LOG.map((log, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-church-green mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900">{log.action}</p>
                        <p className="text-xs text-slate-400">
                          par <strong>{log.user}</strong> · {format(log.date, "dd MMM à HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full text-xs gap-2">
                  <Download className="w-3.5 h-3.5" />
                  Exporter le journal complet
                </Button>
              </CardContent>
            )}
          </Card>

          <Card className="border-none shadow-sm border-rose-100 bg-rose-50/30">
            <CardHeader>
              <CardTitle className="text-base text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Zone de Danger
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl border border-rose-200 bg-white">
                <div>
                  <p className="text-sm font-medium text-slate-900">Réinitialiser tous les accès</p>
                  <p className="text-xs text-slate-400">Déconnecte tous les utilisateurs et efface les sessions actives</p>
                </div>
                <Button size="sm" variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-50">
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>

          <SectionToolbar editing={secEdit} onEdit={() => setSecEdit(true)} onSave={saveSec} onCancel={resetSec} />
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════
            8. SAUVEGARDE & ARCHIVES
        ══════════════════════════════════════════════════════════ */}
        <TabsContent value="backup" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-church-gold" />
                Sauvegarde Automatique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">Sauvegarde quotidienne</p>
                  <p className="text-xs text-slate-400">Sauvegarde automatique chaque jour à l'heure définie</p>
                </div>
                <Switch disabled={!backupEdit} checked={backupSettings.dailyBackup} onCheckedChange={v => backupEdit && setBackupSettings(p => ({...p, dailyBackup: v}))} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">Sauvegarde hebdomadaire</p>
                  <p className="text-xs text-slate-400">Sauvegarde complète chaque dimanche</p>
                </div>
                <Switch disabled={!backupEdit} checked={backupSettings.weeklyBackup} onCheckedChange={v => backupEdit && setBackupSettings(p => ({...p, weeklyBackup: v}))} />
              </div>

              <div className="space-y-2">
                <Label>Heure de sauvegarde automatique</Label>
                {backupEdit
                  ? (
                    <div className="flex items-center gap-3">
                      <Input type="time" value={backupSettings.backupTime} onChange={e => setBackupSettings(p => ({...p, backupTime: e.target.value}))} className="w-36" />
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Heure locale</span>
                    </div>
                  )
                  : <RO value={backupSettings.backupTime} />}
              </div>

              <div className="space-y-2">
                <Label>Durée de rétention des archives</Label>
                {backupEdit
                  ? (
                    <div className="flex items-center gap-3">
                      <Input type="number" min="1" max="60" value={backupSettings.retentionMonths} onChange={e => setBackupSettings(p => ({...p, retentionMonths: e.target.value}))} className="w-24" />
                      <span className="text-sm text-slate-500">mois avant suppression automatique</span>
                    </div>
                  )
                  : <RO value={`${backupSettings.retentionMonths} mois`} />}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Export Manuel</CardTitle>
              <CardDescription>Téléchargez toutes vos données dans le format de votre choix.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-church-green transition-colors text-center space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mx-auto">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">PDF complet</p>
                  <Button size="sm" variant="outline" className="w-full gap-2 text-xs" onClick={() => toast.success('Export PDF lancé...')}>
                    <Download className="w-3.5 h-3.5" />Télécharger
                  </Button>
                </div>
                <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-church-green transition-colors text-center space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto">
                    <Archive className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Excel / CSV</p>
                  <Button size="sm" variant="outline" className="w-full gap-2 text-xs" onClick={() => toast.success('Export Excel lancé...')}>
                    <Download className="w-3.5 h-3.5" />Télécharger
                  </Button>
                </div>
                <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-church-green transition-colors text-center space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mx-auto">
                    <Database className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Sauvegarde JSON</p>
                  <Button size="sm" variant="outline" className="w-full gap-2 text-xs" onClick={() => toast.success('Sauvegarde JSON créée...')}>
                    <Download className="w-3.5 h-3.5" />Télécharger
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Historique des Sauvegardes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {FAKE_ARCHIVES.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Archive className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{a.name}</p>
                        <p className="text-xs text-slate-400">{a.size} · {a.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-xs gap-1 text-slate-500">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs gap-1 text-rose-400 hover:text-rose-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 gap-2 text-sm"
                onClick={() => toast.success('Sauvegarde manuelle lancée !')}
              >
                <RefreshCw className="w-4 h-4" />
                Lancer une sauvegarde maintenant
              </Button>
            </CardContent>
          </Card>

          <SectionToolbar editing={backupEdit} onEdit={() => setBackupEdit(true)} onSave={saveBackup} onCancel={resetBackup} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
