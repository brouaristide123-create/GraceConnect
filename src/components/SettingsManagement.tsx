import React from 'react';
import { useStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { Settings, User, Church, Bell, Globe } from 'lucide-react';

export function SettingsManagement() {
  const { currentUser, updateUser, churches, updateChurch } = useStore();

  // ─── Tab: Profil & Compte ─────────────────────────────────────
  const [profileForm, setProfileForm] = React.useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
  });
  const [passwordForm, setPasswordForm] = React.useState({
    current: '',
    next: '',
    confirm: '',
  });

  const handleSaveProfile = () => {
    if (!currentUser) return;
    updateUser(currentUser.id, {
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      email: profileForm.email,
    });
    toast.success('Profil mis à jour avec succès');
  };

  const handleChangePassword = () => {
    if (!passwordForm.current || !passwordForm.next) {
      toast.error('Veuillez remplir tous les champs de mot de passe');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    toast.success('Mot de passe modifié avec succès');
    setPasswordForm({ current: '', next: '', confirm: '' });
  };

  // ─── Tab: Mon Église ──────────────────────────────────────────
  const church = churches.find((c) => c.id === currentUser?.churchId);
  const [churchForm, setChurchForm] = React.useState({
    name: church?.name || '',
    pastor: church?.pastor || '',
    email: church?.email || '',
    phone: church?.phone || '',
    city: church?.city || '',
    country: church?.country || '',
  });

  const handleSaveChurch = () => {
    if (!church) return;
    updateChurch(church.id, { ...churchForm });
    toast.success('Informations de l\'église mises à jour');
  };

  // ─── Tab: Notifications ───────────────────────────────────────
  const [notifPrefs, setNotifPrefs] = React.useState({
    newMembers: true,
    payments: true,
    upcomingEvents: true,
  });

  const handleSaveNotifications = () => {
    toast.success('Préférences de notifications enregistrées');
  };

  // ─── Tab: Apparence ───────────────────────────────────────────
  const [timezone, setTimezone] = React.useState('Africa/Abidjan');

  const handleApplyAppearance = () => {
    toast.success('Préférences d\'apparence appliquées');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-church-gold" />
          Paramètres
        </h1>
        <p className="text-slate-500 mt-1">Configurez votre compte, votre église et vos préférences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white gap-2">
            <User className="w-4 h-4" />
            Profil & Compte
          </TabsTrigger>
          <TabsTrigger value="church" className="data-[state=active]:bg-white gap-2">
            <Church className="w-4 h-4" />
            Mon Église
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-white gap-2">
            <Globe className="w-4 h-4" />
            Apparence
          </TabsTrigger>
        </TabsList>

        {/* ── PROFIL & COMPTE ── */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base">Informations personnelles</CardTitle>
              <CardDescription>Modifiez vos informations de compte.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <Button
                className="bg-church-gold hover:bg-church-gold/90 text-white"
                onClick={handleSaveProfile}
              >
                Enregistrer
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base">Changer le mot de passe</CardTitle>
              <CardDescription>Sécurisez votre compte avec un nouveau mot de passe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPwd">Mot de passe actuel</Label>
                <Input
                  id="currentPwd"
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPwd">Nouveau mot de passe</Label>
                  <Input
                    id="newPwd"
                    type="password"
                    value={passwordForm.next}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPwd">Confirmer</Label>
                  <Input
                    id="confirmPwd"
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                  />
                </div>
              </div>
              <Button variant="outline" onClick={handleChangePassword}>
                Modifier le mot de passe
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MON ÉGLISE ── */}
        <TabsContent value="church" className="space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base">Informations de l'église</CardTitle>
              <CardDescription>Modifiez les coordonnées et informations générales de votre église.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!church ? (
                <p className="text-sm text-slate-400 italic">Aucune église associée à votre compte.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="churchName">Nom de l'église</Label>
                    <Input
                      id="churchName"
                      value={churchForm.name}
                      onChange={(e) => setChurchForm((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="churchPastor">Pasteur</Label>
                    <Input
                      id="churchPastor"
                      value={churchForm.pastor}
                      onChange={(e) => setChurchForm((p) => ({ ...p, pastor: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="churchEmail">Email</Label>
                      <Input
                        id="churchEmail"
                        type="email"
                        value={churchForm.email}
                        onChange={(e) => setChurchForm((p) => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="churchPhone">Téléphone</Label>
                      <Input
                        id="churchPhone"
                        value={churchForm.phone}
                        onChange={(e) => setChurchForm((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="churchCity">Ville</Label>
                      <Input
                        id="churchCity"
                        value={churchForm.city}
                        onChange={(e) => setChurchForm((p) => ({ ...p, city: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="churchCountry">Pays</Label>
                      <Input
                        id="churchCountry"
                        value={churchForm.country}
                        onChange={(e) => setChurchForm((p) => ({ ...p, country: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button
                    className="bg-church-gold hover:bg-church-gold/90 text-white"
                    onClick={handleSaveChurch}
                  >
                    Enregistrer les modifications
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── NOTIFICATIONS ── */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base">Préférences de notifications</CardTitle>
              <CardDescription>Choisissez les événements pour lesquels vous souhaitez être notifié(e).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Nouvelles inscriptions</p>
                    <p className="text-xs text-slate-500">Notifié(e) à chaque nouvel membre inscrit</p>
                  </div>
                  <Switch
                    checked={notifPrefs.newMembers}
                    onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, newMembers: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Paiements reçus</p>
                    <p className="text-xs text-slate-500">Notifié(e) à chaque transaction enregistrée</p>
                  </div>
                  <Switch
                    checked={notifPrefs.payments}
                    onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, payments: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Événements à venir</p>
                    <p className="text-xs text-slate-500">Rappels avant les événements programmés</p>
                  </div>
                  <Switch
                    checked={notifPrefs.upcomingEvents}
                    onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, upcomingEvents: v }))}
                  />
                </div>
              </div>
              <Button
                className="bg-church-gold hover:bg-church-gold/90 text-white"
                onClick={handleSaveNotifications}
              >
                Enregistrer les préférences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── APPARENCE ── */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base">Langue & Région</CardTitle>
              <CardDescription>Configurez la langue d'affichage et le fuseau horaire.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Langue</Label>
                <Select disabled value="fr">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400 italic">Seul le français est disponible pour le moment.</p>
              </div>

              <div className="space-y-2">
                <Label>Fuseau horaire</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Abidjan">Afrique/Abidjan (GMT+0)</SelectItem>
                    <SelectItem value="Africa/Dakar">Afrique/Dakar (GMT+0)</SelectItem>
                    <SelectItem value="Africa/Lagos">Afrique/Lagos (GMT+1)</SelectItem>
                    <SelectItem value="Africa/Douala">Afrique/Douala (GMT+1)</SelectItem>
                    <SelectItem value="Africa/Nairobi">Afrique/Nairobi (GMT+3)</SelectItem>
                    <SelectItem value="Europe/Paris">Europe/Paris (GMT+1/+2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="bg-church-gold hover:bg-church-gold/90 text-white"
                onClick={handleApplyAppearance}
              >
                Appliquer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
