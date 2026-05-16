import React from 'react';
import {
  Landmark, Plus, Trash2, ArrowUpRight, ArrowDownRight,
  History, Download, TrendingUp, TrendingDown, Wallet,
  FileText, Search, Filter, Calendar, ChevronDown,
} from 'lucide-react';
import { useStore, CashTransaction } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from './ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from './ui/select';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

// ─── Types locaux ───────────────────────────────────────────────
type TxType = CashTransaction['type'];
type PayMethod = CashTransaction['paymentMethod'];

const TX_TYPE_LABELS: Record<TxType, string> = {
  income: 'Entrée', expense: 'Dépense', donation: 'Don',
  offering: 'Offrande', tithe: 'Dîme', transfer: 'Virement',
};

const TX_TYPE_COLORS: Record<TxType, string> = {
  income: 'text-emerald-600 bg-emerald-50',
  expense: 'text-rose-600 bg-rose-50',
  donation: 'text-blue-600 bg-blue-50',
  offering: 'text-purple-600 bg-purple-50',
  tithe: 'text-amber-600 bg-amber-50',
  transfer: 'text-slate-600 bg-slate-100',
};

const TX_SIGN: Record<TxType, 1 | -1> = {
  income: 1, donation: 1, offering: 1, tithe: 1, expense: -1, transfer: 1,
};

// ─── Composant principal ─────────────────────────────────────────
export function CashRegistersManagement() {
  const {
    cashRegisters, cashTransactions,
    addCashRegister, deleteCashRegister,
    addCashTransaction, currentUser, churches, events, services,
  } = useStore();

  // ── Formulaires & états ──
  const [isAddCaisseOpen, setIsAddCaisseOpen] = React.useState(false);
  const [isTxOpen, setIsTxOpen] = React.useState(false);
  const [selectedRegisterId, setSelectedRegisterId] = React.useState<string | null>(null);
  const [historyRegisterId, setHistoryRegisterId] = React.useState<string | null>(null);
  const [searchTx, setSearchTx] = React.useState('');

  const emptyCaisseForm = { name: '', description: '', linkedType: 'general' as 'general' | 'event' | 'service', linkedId: '' };
  const emptyTxForm = { type: 'income' as TxType, amount: '', description: '', category: '', paymentMethod: 'Cash' as PayMethod, notes: '' };

  const [caisseForm, setCaisseForm] = React.useState(emptyCaisseForm);
  const [txForm, setTxForm] = React.useState(emptyTxForm);

  // ── Données de l'église courante ──
  const churchId = currentUser?.churchId || churches[0]?.id || '';
  const myRegisters = (cashRegisters || []).filter(r => r.churchId === churchId);
  const allMyTxs = (cashTransactions || []).filter(t =>
    myRegisters.some(r => r.id === t.registerId)
  );

  // ── Stats globales ──
  const totalBalance = myRegisters.reduce((sum, r) => sum + r.balance, 0);
  const totalIncome = allMyTxs.filter(t => TX_SIGN[t.type] === 1).reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = allMyTxs.filter(t => TX_SIGN[t.type] === -1).reduce((sum, t) => sum + t.amount, 0);

  // ── Historique du registre sélectionné ──
  const historyTxs = historyRegisterId
    ? (cashTransactions || [])
        .filter(t => t.registerId === historyRegisterId)
        .filter(t =>
          t.description.toLowerCase().includes(searchTx.toLowerCase()) ||
          t.category?.toLowerCase().includes(searchTx.toLowerCase())
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const historyRegister = myRegisters.find(r => r.id === historyRegisterId);

  // ── Handlers ──
  const handleCreateRegister = () => {
    if (!caisseForm.name.trim()) { toast.error('Le nom est requis'); return; }
    const linkedItem = caisseForm.linkedType !== 'general'
      ? (caisseForm.linkedType === 'event'
          ? events.find(e => e.id === caisseForm.linkedId)
          : services.find(s => s.id === caisseForm.linkedId))
      : undefined;
    addCashRegister({
      name: caisseForm.name,
      description: caisseForm.description,
      churchId,
      balance: 0,
      isActive: true,
      linkedTo: caisseForm.linkedType !== 'general' ? {
        type: caisseForm.linkedType,
        id: caisseForm.linkedId || undefined,
        name: linkedItem && 'name' in linkedItem ? (linkedItem as any).name :
              linkedItem && 'theme' in linkedItem ? (linkedItem as any).theme : undefined,
      } : undefined,
    });
    setCaisseForm(emptyCaisseForm);
    setIsAddCaisseOpen(false);
    toast.success('Caisse créée avec succès');
  };

  const handleAddTransaction = () => {
    if (!txForm.amount || !txForm.description) {
      toast.error('Montant et description sont requis'); return;
    }
    addCashTransaction({
      registerId: selectedRegisterId!,
      type: txForm.type,
      amount: parseFloat(txForm.amount),
      description: txForm.description,
      category: txForm.category || txForm.type,
      paymentMethod: txForm.paymentMethod,
      date: new Date().toISOString(),
      notes: txForm.notes,
    });
    setTxForm(emptyTxForm);
    setIsTxOpen(false);
    toast.success('Transaction enregistrée');
  };

  const openTx = (registerId: string, type: TxType) => {
    setSelectedRegisterId(registerId);
    setTxForm(f => ({ ...f, type }));
    setIsTxOpen(true);
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return iso; }
  };

  // ── Vue historique ──
  if (historyRegisterId && historyRegister) {
    const regTxs = (cashTransactions || []).filter(t => t.registerId === historyRegisterId);
    const regIncome = regTxs.filter(t => TX_SIGN[t.type] === 1).reduce((s, t) => s + t.amount, 0);
    const regExpense = regTxs.filter(t => TX_SIGN[t.type] === -1).reduce((s, t) => s + t.amount, 0);

    return (
      <div className="space-y-6">
        {/* Retour */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setHistoryRegisterId(null)} className="gap-2 text-slate-600">
            ← Retour aux caisses
          </Button>
          <div className="h-4 w-px bg-slate-300" />
          <span className="text-sm text-slate-500">Historique — {historyRegister.name}</span>
        </div>

        {/* Stats caisse */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Solde actuel', value: historyRegister.balance, color: historyRegister.balance >= 0 ? 'text-emerald-600' : 'text-rose-600', bg: 'from-emerald-50 to-emerald-100 border-emerald-200', icon: <Wallet className="w-5 h-5 text-white" />, iconBg: 'bg-emerald-500' },
            { label: 'Total entrées', value: regIncome, color: 'text-blue-600', bg: 'from-blue-50 to-blue-100 border-blue-200', icon: <ArrowUpRight className="w-5 h-5 text-white" />, iconBg: 'bg-blue-500' },
            { label: 'Total dépenses', value: regExpense, color: 'text-rose-600', bg: 'from-rose-50 to-rose-100 border-rose-200', icon: <ArrowDownRight className="w-5 h-5 text-white" />, iconBg: 'bg-rose-500' },
          ].map((s, i) => (
            <Card key={i} className={cn('bg-gradient-to-br border', s.bg)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.iconBg)}>{s.icon}</div>
                <div>
                  <p className={cn('text-xl font-bold', s.color)}>{s.value.toLocaleString('fr-FR')} <span className="text-sm">FCFA</span></p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Barre d'action + recherche */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Rechercher une transaction..." className="pl-9" value={searchTx} onChange={e => setSearchTx(e.target.value)} />
          </div>
          <Button onClick={() => openTx(historyRegisterId, 'income')} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Entrée
          </Button>
          <Button onClick={() => openTx(historyRegisterId, 'expense')} variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-50 gap-2">
            <Plus className="w-4 h-4" /> Dépense
          </Button>
        </div>

        {/* Liste transactions */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            {historyTxs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <History className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                <p>Aucune transaction trouvée.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {historyTxs.map(tx => (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', TX_TYPE_COLORS[tx.type])}>
                      {TX_SIGN[tx.type] === 1
                        ? <ArrowUpRight className="w-4 h-4" />
                        : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={cn('text-xs px-1.5 py-0 h-4 hover:opacity-100', TX_TYPE_COLORS[tx.type])}>{TX_TYPE_LABELS[tx.type]}</Badge>
                        {tx.category && tx.category !== tx.type && <span className="text-xs text-slate-400">{tx.category}</span>}
                        <span className="text-xs text-slate-400">{tx.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn('text-sm font-bold', TX_SIGN[tx.type] === 1 ? 'text-emerald-600' : 'text-rose-600')}>
                        {TX_SIGN[tx.type] === 1 ? '+' : '-'}{tx.amount.toLocaleString('fr-FR')} FCFA
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Vue principale ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Landmark className="w-6 h-6 text-church-gold" />
            Gestion des Caisses
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gérez les caisses de votre église — soldes, entrées, dépenses, historique.
          </p>
        </div>
        <Button onClick={() => setIsAddCaisseOpen(true)} className="bg-church-gold hover:bg-church-gold/90 text-white gap-2">
          <Plus className="w-4 h-4" /> Créer une caisse
        </Button>
      </div>

      {/* KPI globaux */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Solde total', value: totalBalance, color: totalBalance >= 0 ? 'text-emerald-700' : 'text-rose-700', bg: 'from-emerald-50 to-emerald-100 border-emerald-200', icon: <Wallet className="w-5 h-5 text-white" />, iconBg: 'bg-emerald-500' },
          { label: 'Total reçu', value: totalIncome, color: 'text-blue-700', bg: 'from-blue-50 to-blue-100 border-blue-200', icon: <TrendingUp className="w-5 h-5 text-white" />, iconBg: 'bg-blue-500' },
          { label: 'Total dépensé', value: totalExpense, color: 'text-rose-700', bg: 'from-rose-50 to-rose-100 border-rose-200', icon: <TrendingDown className="w-5 h-5 text-white" />, iconBg: 'bg-rose-500' },
        ].map((kpi, i) => (
          <Card key={i} className={cn('bg-gradient-to-br border', kpi.bg)}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', kpi.iconBg)}>{kpi.icon}</div>
              <div>
                <p className={cn('text-2xl font-bold', kpi.color)}>{kpi.value.toLocaleString('fr-FR')} <span className="text-sm font-normal">FCFA</span></p>
                <p className="text-xs text-slate-500">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Liste des caisses */}
      {myRegisters.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Landmark className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600">Aucune caisse créée</h3>
          <p className="text-slate-400 text-sm mt-1 mb-4">Créez votre première caisse pour commencer à gérer les fonds.</p>
          <Button onClick={() => setIsAddCaisseOpen(true)} className="bg-church-gold hover:bg-church-gold/90 text-white gap-2">
            <Plus className="w-4 h-4" /> Créer une caisse
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myRegisters.map(reg => {
            const regTxs = (cashTransactions || []).filter(t => t.registerId === reg.id);
            const lastTx = [...regTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            return (
              <Card key={reg.id} className="border-none shadow-md hover:shadow-lg transition-all group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{reg.name}</CardTitle>
                      {reg.description && (
                        <CardDescription className="text-xs mt-0.5 truncate">{reg.description}</CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      onClick={() => {
                        if (window.confirm(`Supprimer la caisse "${reg.name}" ?`)) {
                          deleteCashRegister(reg.id);
                          toast.success('Caisse supprimée');
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Solde */}
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                    <span className="text-xs text-slate-500 font-medium">Solde actuel</span>
                    <span className={cn('text-2xl font-bold', reg.balance >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                      {reg.balance.toLocaleString('fr-FR')} <span className="text-sm font-normal">FCFA</span>
                    </span>
                  </div>

                  {/* Lien */}
                  {reg.linkedTo && (
                    <Badge variant="outline" className="text-xs text-slate-500 w-full justify-center">
                      {reg.linkedTo.type === 'event' ? '📅 Événement' : reg.linkedTo.type === 'service' ? '⛪ Culte' : '🏦 Général'}
                      {reg.linkedTo.name ? ` — ${reg.linkedTo.name}` : ''}
                    </Badge>
                  )}

                  {/* Info transactions */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{regTxs.length} transaction{regTxs.length !== 1 ? 's' : ''}</span>
                    {lastTx && <span>Dernière : {formatDate(lastTx.date)}</span>}
                  </div>

                  {/* Boutons d'action */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 col-span-1"
                      onClick={() => openTx(reg.id, 'income')}>
                      <ArrowUpRight className="w-3 h-3 mr-1" /> Entrée
                    </Button>
                    <Button size="sm" variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50 text-xs h-8 col-span-1"
                      onClick={() => openTx(reg.id, 'expense')}>
                      <ArrowDownRight className="w-3 h-3 mr-1" /> Dépense
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-8 col-span-1"
                      onClick={() => openTx(reg.id, 'donation')}>
                      Don
                    </Button>
                  </div>

                  {/* Historique */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-slate-500 hover:text-church-gold hover:bg-church-gold/5 gap-2"
                    onClick={() => { setHistoryRegisterId(reg.id); setSearchTx(''); }}
                  >
                    <History className="w-3.5 h-3.5" /> Voir l'historique ({regTxs.length})
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Dialog Créer caisse ── */}
      <Dialog open={isAddCaisseOpen} onOpenChange={setIsAddCaisseOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-church-gold">
              <Landmark className="w-5 h-5" /> Créer une nouvelle caisse
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nom *</label>
              <Input placeholder="Ex: Caisse Principale, Caisse Concert..." value={caisseForm.name}
                onChange={e => setCaisseForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
              <Input placeholder="Description optionnelle..." value={caisseForm.description}
                onChange={e => setCaisseForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Liée à</label>
              <Select value={caisseForm.linkedType} onValueChange={(v: any) => setCaisseForm(f => ({ ...f, linkedType: v, linkedId: '' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">🏦 Général</SelectItem>
                  <SelectItem value="event">📅 Événement</SelectItem>
                  <SelectItem value="service">⛪ Culte</SelectItem>
                </SelectContent>
              </Select>
              {caisseForm.linkedType === 'event' && (
                <Select value={caisseForm.linkedId} onValueChange={v => setCaisseForm(f => ({ ...f, linkedId: v }))}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Choisir un événement" /></SelectTrigger>
                  <SelectContent>
                    {events.filter(e => e.churchId === churchId).map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {caisseForm.linkedType === 'service' && (
                <Select value={caisseForm.linkedId} onValueChange={v => setCaisseForm(f => ({ ...f, linkedId: v }))}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Choisir un culte" /></SelectTrigger>
                  <SelectContent>
                    {services.filter(s => s.churchId === churchId).map(s => (
                      <SelectItem key={s.id} value={s.id}>{(s as any).theme || s.date}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCaisseOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateRegister} className="bg-church-gold hover:bg-church-gold/90 text-white">Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Nouvelle transaction ── */}
      <Dialog open={isTxOpen} onOpenChange={setIsTxOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {TX_SIGN[txForm.type] === 1
                ? <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                : <ArrowDownRight className="w-5 h-5 text-rose-500" />}
              Nouvelle transaction
              {selectedRegisterId && (
                <span className="text-slate-400 text-sm font-normal">
                  — {myRegisters.find(r => r.id === selectedRegisterId)?.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Type</label>
              <Select value={txForm.type} onValueChange={(v: any) => setTxForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">↑ Entrée</SelectItem>
                  <SelectItem value="expense">↓ Dépense</SelectItem>
                  <SelectItem value="donation">❤ Don</SelectItem>
                  <SelectItem value="offering">🙏 Offrande</SelectItem>
                  <SelectItem value="tithe">💰 Dîme</SelectItem>
                  <SelectItem value="transfer">↔ Virement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Montant (FCFA) *</label>
              <Input type="number" min="0" placeholder="0" value={txForm.amount}
                onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description *</label>
              <Input placeholder="Ex: Quête du dimanche, Achat chaises..." value={txForm.description}
                onChange={e => setTxForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Catégorie</label>
                <Input placeholder="Ex: Quête, Frais..." value={txForm.category}
                  onChange={e => setTxForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Méthode de paiement</label>
                <Select value={txForm.paymentMethod} onValueChange={(v: any) => setTxForm(f => ({ ...f, paymentMethod: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">💵 Cash</SelectItem>
                    <SelectItem value="Mobile Money">📱 Mobile Money</SelectItem>
                    <SelectItem value="Bank">🏦 Virement</SelectItem>
                    <SelectItem value="Wave">🌊 Wave</SelectItem>
                    <SelectItem value="Djamo">💳 Djamo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Notes (optionnel)</label>
              <Input placeholder="Notes complémentaires..." value={txForm.notes}
                onChange={e => setTxForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTxOpen(false)}>Annuler</Button>
            <Button onClick={handleAddTransaction}
              className={cn('text-white', txForm.type === 'expense' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700')}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
