import React, { useState, useMemo } from 'react';
import {
  Landmark, Plus, Trash2, ArrowUpRight, ArrowDownRight, ArrowLeftRight,
  History, TrendingUp, TrendingDown, Wallet, Edit2,
  Search, CheckCircle, XCircle, Clock, AlertTriangle,
  ChevronLeft, Coins, BookOpen,
} from 'lucide-react';
import { useStore, CashRegister, CashTransaction } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

// ─── Constantes ───────────────────────────────────────────────────────────────

const INCOME_TYPES: CashTransaction['type'][] = ['income', 'donation', 'offering', 'tithe', 'contribution', 'event_payment', 'transfer_in'];
const EXPENSE_TYPES: CashTransaction['type'][] = ['expense', 'assistance', 'purchase', 'invoice', 'works', 'transfer_out'];

const TX_LABELS: Record<CashTransaction['type'], string> = {
  income: 'Entrée générale', expense: 'Dépense générale', donation: 'Don',
  offering: 'Offrande', tithe: 'Dîme', contribution: 'Contribution',
  event_payment: 'Paiement événement', assistance: 'Assistance',
  purchase: 'Achat', invoice: 'Facture', works: 'Travaux',
  transfer_in: 'Transfert reçu', transfer_out: 'Transfert envoyé',
};

const REG_TYPE_LABELS: Record<NonNullable<CashRegister['type']>, string> = {
  principale: 'Caisse Principale', projet: 'Caisse Projet',
  departement: 'Caisse Département', evenement: 'Caisse Événement',
  assistance: 'Caisse Assistance', formation: 'Caisse Formation', autre: 'Autre',
};

const COLORS = [
  { label: 'Vert',   value: '#10b981' }, { label: 'Bleu',   value: '#3b82f6' },
  { label: 'Violet', value: '#8b5cf6' }, { label: 'Orange', value: '#f59e0b' },
  { label: 'Rouge',  value: '#ef4444' }, { label: 'Rose',   value: '#ec4899' },
  { label: 'Cyan',   value: '#06b6d4' }, { label: 'Ardoise',value: '#64748b' },
];

const PAY_METHODS: CashTransaction['paymentMethod'][] = ['Espèces', 'Mobile Money', 'Wave', 'Djamo', 'Virement', 'Carte', 'Cash', 'Bank'];

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// Valeur sentinelle pour "Aucun" dans les Selects (évite le bug Base UI avec value="")
const NONE = '__none__';

// ─── Composants utilitaires ───────────────────────────────────────────────────

function TxBadge({ type }: { type: CashTransaction['type'] }) {
  const isIn = INCOME_TYPES.includes(type);
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
      isIn ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
      {isIn ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {TX_LABELS[type] || type}
    </span>
  );
}

function StatusBadge({ status }: { status?: CashTransaction['validationStatus'] }) {
  if (!status || status === 'approved')
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700"><CheckCircle className="w-3 h-3" />Validé</span>;
  if (status === 'pending')
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700"><Clock className="w-3 h-3" />En attente</span>;
  return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700"><XCircle className="w-3 h-3" />Rejeté</span>;
}

// ─── CreateRegisterDialog ─────────────────────────────────────────────────────

interface CreateRegisterDialogProps {
  open: boolean; onClose: () => void; register?: CashRegister | null;
}

const BLANK_REG = {
  name: '', description: '',
  regType: 'principale' as NonNullable<CashRegister['type']>,
  typeCustom: '',
  cashierId: NONE, cashierName: '',
  responsibleId: NONE, responsibleName: '',
  initialBalance: '', alertThreshold: '',
  isActive: true, allowExpenses: true, allowExternalContributions: false,
  color: '#10b981',
  linkedType: 'general' as 'general' | 'event' | 'service' | 'department',
  linkedId: NONE, linkedName: '',
};

export function CreateRegisterDialog({ open, onClose, register }: CreateRegisterDialogProps) {
  const { addCashRegister, updateCashRegister, currentUser, members, departments, events } = useStore();
  const churchId = currentUser?.churchId || '';

  const [form, setForm] = useState({ ...BLANK_REG });

  React.useEffect(() => {
    if (!open) return;
    if (register) {
      setForm({
        name: register.name,
        description: register.description || '',
        regType: register.type || 'principale',
        typeCustom: register.typeCustom || '',
        cashierId: register.cashierId || NONE,
        cashierName: register.cashierName || '',
        responsibleId: register.responsibleId || NONE,
        responsibleName: register.responsibleName || '',
        initialBalance: String(register.initialBalance ?? 0),
        alertThreshold: String(register.alertThreshold ?? ''),
        isActive: register.isActive,
        allowExpenses: register.allowExpenses ?? true,
        allowExternalContributions: register.allowExternalContributions ?? false,
        color: register.color || '#10b981',
        linkedType: (register.linkedTo?.type as typeof BLANK_REG['linkedType']) || 'general',
        linkedId: register.linkedTo?.id || NONE,
        linkedName: register.linkedTo?.name || '',
      });
    } else {
      setForm({ ...BLANK_REG });
    }
  }, [open, register]);

  const setF = <K extends keyof typeof BLANK_REG>(k: K, v: (typeof BLANK_REG)[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const churchMembers = (members || []).filter(m => m.churchId === churchId);
  const churchDepts   = (departments || []).filter(d => d.churchId === churchId);
  const churchEvents  = (events || []).filter(e => e.churchId === churchId);

  function handleSubmit() {
    try {
      if (!form.name.trim()) { toast.error('Le nom est obligatoire'); return; }
      const initBal = Number(form.initialBalance) || 0;
      const payload: Omit<CashRegister, 'id' | 'createdAt'> = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        churchId,
        type: form.regType,
        typeCustom: form.regType === 'autre' ? form.typeCustom : undefined,
        cashierId: form.cashierId !== NONE ? form.cashierId : undefined,
        cashierName: form.cashierName || undefined,
        responsibleId: form.responsibleId !== NONE ? form.responsibleId : undefined,
        responsibleName: form.responsibleName || undefined,
        initialBalance: initBal,
        balance: register ? (register.balance + (initBal - (register.initialBalance ?? 0))) : initBal,
        isActive: form.isActive,
        allowExpenses: form.allowExpenses,
        allowExternalContributions: form.allowExternalContributions,
        color: form.color,
        alertThreshold: form.alertThreshold ? Number(form.alertThreshold) : undefined,
        linkedTo: form.linkedType !== 'general' && form.linkedId !== NONE
          ? { type: form.linkedType, id: form.linkedId, name: form.linkedName || undefined }
          : undefined,
      };
      if (register) {
        updateCashRegister(register.id, payload);
        toast.success('Caisse mise à jour avec succès');
      } else {
        addCashRegister(payload);
        toast.success('Caisse créée avec succès ! 🎉');
      }
      onClose();
    } catch (err) {
      console.error('Erreur création caisse:', err);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-600" />
            {register ? 'Modifier la caisse' : 'Créer une nouvelle caisse'}
          </DialogTitle>
        </DialogHeader>

        {/* Zone scrollable */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4 py-2">

            {/* Nom */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Nom de la caisse *</label>
              <Input value={form.name} onChange={e => setF('name', e.target.value)}
                placeholder="Ex : Caisse Principale 2025" />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
              <textarea rows={2}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.description}
                onChange={e => setF('description', e.target.value)}
                placeholder="Description optionnelle..." />
            </div>

            {/* Type */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Type de caisse</label>
              <Select value={form.regType} onValueChange={v => setF('regType', v as typeof form.regType)}>
                <SelectTrigger className="w-full">
                  <span className="flex-1 text-left text-sm">{REG_TYPE_LABELS[form.regType]}</span>
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(REG_TYPE_LABELS) as [NonNullable<CashRegister['type']>, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type custom */}
            {form.regType === 'autre' && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Précisez</label>
                <Input value={form.typeCustom} onChange={e => setF('typeCustom', e.target.value)} placeholder="Ex : Caisse urgences" />
              </div>
            )}

            {/* Lien */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Liée à</label>
              <Select value={form.linkedType} onValueChange={v => setF('linkedType', v as typeof form.linkedType)}>
                <SelectTrigger className="w-full">
                  <span className="flex-1 text-left text-sm">
                    {form.linkedType === 'general' ? 'Général' : form.linkedType === 'department' ? 'Département' : form.linkedType === 'event' ? 'Événement' : 'Culte/Service'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Général</SelectItem>
                  <SelectItem value="department">Département</SelectItem>
                  <SelectItem value="event">Événement</SelectItem>
                  <SelectItem value="service">Culte / Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.linkedType === 'department' && churchDepts.length > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Département</label>
                <Select value={form.linkedId} onValueChange={v => {
                  const d = churchDepts.find(x => x.id === v);
                  setF('linkedId', v); setF('linkedName', d?.name || '');
                }}>
                  <SelectTrigger className="w-full">
                    <span className="flex-1 text-left text-sm">{form.linkedName || 'Choisir un département...'}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {churchDepts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.linkedType === 'event' && churchEvents.length > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Événement</label>
                <Select value={form.linkedId} onValueChange={v => {
                  const e = churchEvents.find(x => x.id === v);
                  setF('linkedId', v); setF('linkedName', (e as any)?.title || (e as any)?.name || '');
                }}>
                  <SelectTrigger className="w-full">
                    <span className="flex-1 text-left text-sm">{form.linkedName || 'Choisir un événement...'}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {churchEvents.map(e => <SelectItem key={e.id} value={e.id}>{(e as any).title || (e as any).name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Caissier */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Caissier</label>
              <Select value={form.cashierId} onValueChange={v => {
                const m = churchMembers.find(x => x.id === v);
                setF('cashierId', v);
                setF('cashierName', m ? `${m.firstName} ${m.lastName}` : '');
              }}>
                <SelectTrigger className="w-full">
                  <span className="flex-1 text-left text-sm">
                    {form.cashierId === NONE ? 'Aucun' : form.cashierName || 'Choisir...'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Aucun</SelectItem>
                  {churchMembers.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Responsable */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Responsable</label>
              <Select value={form.responsibleId} onValueChange={v => {
                const m = churchMembers.find(x => x.id === v);
                setF('responsibleId', v);
                setF('responsibleName', m ? `${m.firstName} ${m.lastName}` : '');
              }}>
                <SelectTrigger className="w-full">
                  <span className="flex-1 text-left text-sm">
                    {form.responsibleId === NONE ? 'Aucun' : form.responsibleName || 'Choisir...'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Aucun</SelectItem>
                  {churchMembers.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Solde initial */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Solde initial (FCFA)</label>
              <Input type="number" min={0} value={form.initialBalance}
                onChange={e => setF('initialBalance', e.target.value)} placeholder="0" />
            </div>

            {/* Seuil alerte */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Seuil d'alerte (FCFA)</label>
              <Input type="number" min={0} value={form.alertThreshold}
                onChange={e => setF('alertThreshold', e.target.value)} placeholder="Ex : 50000" />
            </div>

            {/* Couleur */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Couleur</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c.value} type="button" title={c.label}
                    className={cn('w-8 h-8 rounded-full border-2 transition-all hover:scale-110',
                      form.color === c.value ? 'border-slate-800 scale-110 ring-2 ring-offset-2 ring-slate-400' : 'border-white shadow')}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setF('color', c.value)} />
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="col-span-2 flex flex-wrap gap-5">
              {([
                ['isActive', 'Caisse active'],
                ['allowExpenses', 'Autoriser les dépenses'],
                ['allowExternalContributions', 'Contributions externes'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-700">
                  <input type="checkbox" className="rounded accent-emerald-600"
                    checked={form[key] as boolean}
                    onChange={e => setF(key, e.target.checked as (typeof BLANK_REG)[typeof key])} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer fixe */}
        <DialogFooter className="shrink-0 pt-3 border-t border-slate-100 mt-2">
          <Button variant="outline" type="button" onClick={onClose}>Annuler</Button>
          <Button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}>
            {register ? 'Enregistrer les modifications' : 'Créer la caisse'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── AddTransactionDialog ─────────────────────────────────────────────────────

interface AddTransactionDialogProps { open: boolean; onClose: () => void; registerId?: string }

const BLANK_TX = {
  registerId: NONE,
  txType: 'income' as CashTransaction['type'],
  isIncome: true,
  amount: '',
  description: '',
  paymentMethod: 'Espèces' as CashTransaction['paymentMethod'],
  sourceOrBeneficiary: '',
  notes: '',
  attachmentType: NONE,
  requireValidation: false,
  date: new Date().toISOString().slice(0, 16),
};

export function AddTransactionDialog({ open, onClose, registerId }: AddTransactionDialogProps) {
  const { addCashTransaction, cashRegisters, currentUser } = useStore();
  const churchId = currentUser?.churchId || '';
  const authorName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim();

  const [form, setForm] = useState({ ...BLANK_TX });
  React.useEffect(() => {
    if (open) setForm({ ...BLANK_TX, registerId: registerId || NONE });
  }, [open, registerId]);

  const setF = <K extends keyof typeof BLANK_TX>(k: K, v: (typeof BLANK_TX)[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const registers = (cashRegisters || []).filter(r => r.churchId === churchId && r.isActive);
  const selectedReg = registers.find(r => r.id === form.registerId);
  const selectedRegName = selectedReg?.name || 'Choisir une caisse...';

  const INCOME_OPTS = [
    { value: 'income', label: 'Entrée générale' }, { value: 'tithe', label: 'Dîme' },
    { value: 'offering', label: 'Offrande' }, { value: 'donation', label: 'Don' },
    { value: 'contribution', label: 'Contribution' }, { value: 'event_payment', label: 'Paiement événement' },
  ];
  const EXPENSE_OPTS = [
    { value: 'expense', label: 'Dépense générale' }, { value: 'purchase', label: 'Achat' },
    { value: 'invoice', label: 'Facture' }, { value: 'works', label: 'Travaux' },
    { value: 'assistance', label: 'Assistance' },
  ];

  const txTypeLabel = TX_LABELS[form.txType] || form.txType;
  const payMethLabel = form.paymentMethod;
  const attachLabel = form.attachmentType === NONE ? 'Aucun' : form.attachmentType === 'receipt' ? 'Reçu' : form.attachmentType === 'invoice' ? 'Facture' : 'Photo';

  function handleSubmit() {
    try {
      if (form.registerId === NONE) { toast.error('Choisissez une caisse'); return; }
      if (!form.amount || Number(form.amount) <= 0) { toast.error('Montant invalide'); return; }
      if (!form.description.trim()) { toast.error('Description obligatoire'); return; }
      if (!form.isIncome && selectedReg && !selectedReg.allowExpenses) {
        toast.error("Cette caisse n'autorise pas les dépenses"); return;
      }
      addCashTransaction({
        registerId: form.registerId,
        type: form.txType,
        amount: Number(form.amount),
        description: form.description.trim(),
        category: TX_LABELS[form.txType],
        paymentMethod: form.paymentMethod,
        date: new Date(form.date).toISOString(),
        authorId: currentUser?.id,
        authorName,
        sourceOrBeneficiary: form.sourceOrBeneficiary || undefined,
        notes: form.notes || undefined,
        attachmentType: form.attachmentType !== NONE ? (form.attachmentType as CashTransaction['attachmentType']) : undefined,
        validationStatus: form.requireValidation ? 'pending' : 'approved',
      });
      toast.success('Transaction enregistrée avec succès !');
      onClose();
    } catch (err) {
      console.error('Erreur transaction:', err);
      toast.error('Une erreur est survenue.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600" />Nouvelle transaction
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3 py-2">

            {/* Caisse */}
            {!registerId && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Caisse *</label>
                <Select value={form.registerId} onValueChange={v => setF('registerId', v)}>
                  <SelectTrigger className="w-full">
                    <span className="flex-1 text-left text-sm">{form.registerId === NONE ? 'Choisir une caisse...' : selectedRegName}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {registers.map(r => <SelectItem key={r.id} value={r.id}>{r.name} — {fmt(r.balance)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Flux Entrée / Sortie */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Type de flux</label>
              <div className="flex gap-2">
                <button type="button"
                  className={cn('flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                    form.isIncome ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-white border-slate-200 text-slate-600')}
                  onClick={() => { setF('isIncome', true); setF('txType', 'income'); }}>
                  <ArrowUpRight className="w-4 h-4 inline mr-1" />Entrée
                </button>
                <button type="button"
                  className={cn('flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                    !form.isIncome ? 'bg-rose-50 border-rose-400 text-rose-700' : 'bg-white border-slate-200 text-slate-600')}
                  onClick={() => { setF('isIncome', false); setF('txType', 'expense'); }}>
                  <ArrowDownRight className="w-4 h-4 inline mr-1" />Sortie
                </button>
              </div>
            </div>

            {/* Catégorie précise */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Catégorie *</label>
              <Select value={form.txType} onValueChange={v => setF('txType', v as CashTransaction['type'])}>
                <SelectTrigger className="w-full">
                  <span className="flex-1 text-left text-sm">{txTypeLabel}</span>
                </SelectTrigger>
                <SelectContent>
                  {(form.isIncome ? INCOME_OPTS : EXPENSE_OPTS).map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Montant */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Montant (FCFA) *</label>
              <Input type="number" min={1} value={form.amount}
                onChange={e => setF('amount', e.target.value)} placeholder="0" />
            </div>

            {/* Mode de paiement */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Mode de paiement</label>
              <Select value={form.paymentMethod} onValueChange={v => setF('paymentMethod', v as CashTransaction['paymentMethod'])}>
                <SelectTrigger className="w-full">
                  <span className="flex-1 text-left text-sm">{payMethLabel}</span>
                </SelectTrigger>
                <SelectContent>
                  {PAY_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Date</label>
              <Input type="datetime-local" value={form.date} onChange={e => setF('date', e.target.value)} />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Description *</label>
              <Input value={form.description} onChange={e => setF('description', e.target.value)}
                placeholder="Objet de la transaction..." />
            </div>

            {/* Source / Bénéficiaire */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                {form.isIncome ? 'Source / Donateur' : 'Bénéficiaire / Fournisseur'}
              </label>
              <Input value={form.sourceOrBeneficiary} onChange={e => setF('sourceOrBeneficiary', e.target.value)}
                placeholder="Nom ou entité..." />
            </div>

            {/* Justificatif */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Justificatif</label>
              <Select value={form.attachmentType} onValueChange={v => setF('attachmentType', v)}>
                <SelectTrigger className="w-full">
                  <span className="flex-1 text-left text-sm">{attachLabel}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Aucun</SelectItem>
                  <SelectItem value="receipt">Reçu</SelectItem>
                  <SelectItem value="invoice">Facture</SelectItem>
                  <SelectItem value="photo">Photo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Notes</label>
              <textarea rows={2}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.notes} onChange={e => setF('notes', e.target.value)}
                placeholder="Notes supplémentaires..." />
            </div>

            {/* Validation */}
            {!form.isIncome && (
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-700">
                  <input type="checkbox" className="rounded accent-emerald-600"
                    checked={form.requireValidation}
                    onChange={e => setF('requireValidation', e.target.checked)} />
                  Soumettre à validation (Pasteur / Trésorier)
                </label>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 pt-3 border-t border-slate-100 mt-2">
          <Button variant="outline" type="button" onClick={onClose}>Annuler</Button>
          <Button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── TransferDialog ────────────────────────────────────────────────────────────

interface TransferDialogProps { open: boolean; onClose: () => void; fromId?: string }

export function TransferDialog({ open, onClose, fromId }: TransferDialogProps) {
  const { transferBetweenRegisters, cashRegisters, currentUser } = useStore();
  const churchId = currentUser?.churchId || '';
  const authorName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim();
  const registers = (cashRegisters || []).filter(r => r.churchId === churchId && r.isActive);

  const [form, setForm] = useState({ fromId: fromId || NONE, toId: NONE, amount: '', motif: '' });
  React.useEffect(() => {
    if (open) setForm({ fromId: fromId || NONE, toId: NONE, amount: '', motif: '' });
  }, [open, fromId]);

  const fromReg = registers.find(r => r.id === form.fromId);
  const toReg = registers.find(r => r.id === form.toId);

  function handleSubmit() {
    try {
      if (form.fromId === NONE || form.toId === NONE) { toast.error('Sélectionnez les deux caisses'); return; }
      if (form.fromId === form.toId) { toast.error('Les caisses doivent être différentes'); return; }
      if (!form.amount || Number(form.amount) <= 0) { toast.error('Montant invalide'); return; }
      if (fromReg && fromReg.balance < Number(form.amount)) { toast.error('Solde insuffisant'); return; }
      transferBetweenRegisters(form.fromId, form.toId, Number(form.amount), form.motif, currentUser?.id, authorName);
      toast.success(`Transfert de ${fmt(Number(form.amount))} effectué avec succès`);
      onClose();
    } catch (err) {
      console.error('Erreur transfert:', err);
      toast.error('Une erreur est survenue.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-blue-600" />Transfert entre caisses
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Caisse source</label>
            <Select value={form.fromId} onValueChange={v => setForm(p => ({ ...p, fromId: v }))}>
              <SelectTrigger className="w-full">
                <span className="flex-1 text-left text-sm">
                  {form.fromId === NONE ? 'De...' : `${fromReg?.name || '?'} — ${fmt(fromReg?.balance || 0)}`}
                </span>
              </SelectTrigger>
              <SelectContent>
                {registers.filter(r => r.id !== form.toId).map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name} — {fmt(r.balance)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Caisse destination</label>
            <Select value={form.toId} onValueChange={v => setForm(p => ({ ...p, toId: v }))}>
              <SelectTrigger className="w-full">
                <span className="flex-1 text-left text-sm">
                  {form.toId === NONE ? 'Vers...' : `${toReg?.name || '?'} — ${fmt(toReg?.balance || 0)}`}
                </span>
              </SelectTrigger>
              <SelectContent>
                {registers.filter(r => r.id !== form.fromId).map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name} — {fmt(r.balance)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Montant (FCFA) *</label>
            <Input type="number" min={1} value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Motif</label>
            <Input value={form.motif} onChange={e => setForm(p => ({ ...p, motif: e.target.value }))}
              placeholder="Motif du transfert..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Annuler</Button>
          <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit}>Transférer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── RegisterDetail ────────────────────────────────────────────────────────────

function RegisterDetail({ register, onBack }: { register: CashRegister; onBack: () => void }) {
  const { cashTransactions, deleteCashRegister, validateTransaction, currentUser } = useStore();
  const [showTx, setShowTx] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [txSearch, setTxSearch] = useState('');
  const [txFilter, setTxFilter] = useState<'all' | 'income' | 'expense' | 'pending'>('all');
  const authorName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim();

  const txs = useMemo(() =>
    (cashTransactions || []).filter(t => t.registerId === register.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [cashTransactions, register.id]);

  const filtered = useMemo(() => txs.filter(t => {
    if (txFilter === 'income' && !INCOME_TYPES.includes(t.type)) return false;
    if (txFilter === 'expense' && !EXPENSE_TYPES.includes(t.type)) return false;
    if (txFilter === 'pending' && t.validationStatus !== 'pending') return false;
    if (txSearch && !t.description.toLowerCase().includes(txSearch.toLowerCase()) &&
        !(t.sourceOrBeneficiary || '').toLowerCase().includes(txSearch.toLowerCase())) return false;
    return true;
  }), [txs, txFilter, txSearch]);

  const totalIn  = txs.filter(t => INCOME_TYPES.includes(t.type) && t.validationStatus !== 'rejected').reduce((s, t) => s + t.amount, 0);
  const totalOut = txs.filter(t => EXPENSE_TYPES.includes(t.type) && t.validationStatus !== 'rejected').reduce((s, t) => s + t.amount, 0);
  const pending  = txs.filter(t => t.validationStatus === 'pending').length;
  const canValidate = ['admin', 'super_admin', 'church_admin', 'treasurer'].includes(currentUser?.role || '');

  const txFilterLabel = txFilter === 'all' ? 'Toutes' : txFilter === 'income' ? 'Entrées' : txFilter === 'expense' ? 'Sorties' : 'En attente';

  return (
    <div className="space-y-6">
      {/* Barre du haut */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ChevronLeft className="w-5 h-5" /><span className="font-medium">Retour aux caisses</span>
        </button>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowTransfer(true)}>
            <ArrowLeftRight className="w-4 h-4 mr-1" />Transférer
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowTx(true)}>
            <Plus className="w-4 h-4 mr-1" />Transaction
          </Button>
          <Button size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50"
            onClick={() => { if (window.confirm(`Supprimer "${register.name}" ?`)) { deleteCashRegister(register.id); onBack(); toast.success('Caisse supprimée'); } }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Carte de la caisse */}
      <div className="rounded-2xl p-6 text-white shadow-lg" style={{ backgroundColor: register.color || '#10b981' }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="w-6 h-6 opacity-80" />
              <span className="text-xl font-bold">{register.name}</span>
              {!register.isActive && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Inactif</span>}
            </div>
            {register.type && <p className="text-white/70 text-sm">{REG_TYPE_LABELS[register.type]}</p>}
            {register.description && <p className="text-white/60 text-sm mt-1">{register.description}</p>}
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm">Solde actuel</p>
            <p className="text-3xl font-bold">{fmt(register.balance)}</p>
          </div>
        </div>
        {register.alertThreshold && register.balance <= register.alertThreshold && (
          <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 text-sm">
            <AlertTriangle className="w-4 h-4" />Solde en dessous du seuil d'alerte ({fmt(register.alertThreshold)})
          </div>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: ArrowUpRight, label: 'Total entrées', value: fmt(totalIn), color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { icon: ArrowDownRight, label: 'Total sorties', value: fmt(totalOut), color: 'text-rose-700', bg: 'bg-rose-50' },
          { icon: History, label: 'Transactions', value: String(txs.length), color: 'text-blue-700', bg: 'bg-blue-50' },
          { icon: Clock, label: 'En attente', value: String(pending), color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3">
              <div className={cn('inline-flex p-1.5 rounded-lg mb-2', bg)}>
                <Icon className={cn('w-4 h-4', color)} />
              </div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className={cn('text-lg font-bold', color)}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Historique */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">Historique des transactions</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <Input className="pl-8 h-9 w-44" placeholder="Rechercher..." value={txSearch} onChange={e => setTxSearch(e.target.value)} />
              </div>
              <Select value={txFilter} onValueChange={v => setTxFilter(v as typeof txFilter)}>
                <SelectTrigger className="h-9 w-36">
                  <span className="text-sm">{txFilterLabel}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="income">Entrées</SelectItem>
                  <SelectItem value="expense">Sorties</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Aucune transaction trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase">
                    <th className="text-left px-4 py-2">Date</th>
                    <th className="text-left px-4 py-2">Type</th>
                    <th className="text-left px-4 py-2">Description</th>
                    <th className="text-left px-4 py-2">Source / Bénéficiaire</th>
                    <th className="text-left px-4 py-2">Méthode</th>
                    <th className="text-right px-4 py-2">Montant</th>
                    <th className="text-center px-4 py-2">Statut</th>
                    {canValidate && <th className="text-center px-4 py-2">Valider</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(tx => {
                    const isIn = INCOME_TYPES.includes(tx.type);
                    return (
                      <tr key={tx.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{fmtDate(tx.date)}</td>
                        <td className="px-4 py-3"><TxBadge type={tx.type} /></td>
                        <td className="px-4 py-3 font-medium text-slate-800">{tx.description}</td>
                        <td className="px-4 py-3 text-slate-500">{tx.sourceOrBeneficiary || '—'}</td>
                        <td className="px-4 py-3 text-slate-500">{tx.paymentMethod}</td>
                        <td className={cn('px-4 py-3 text-right font-semibold whitespace-nowrap', isIn ? 'text-emerald-700' : 'text-rose-700')}>
                          {isIn ? '+' : '-'}{fmt(tx.amount)}
                        </td>
                        <td className="px-4 py-3 text-center"><StatusBadge status={tx.validationStatus} /></td>
                        {canValidate && (
                          <td className="px-4 py-3 text-center">
                            {tx.validationStatus === 'pending' && (
                              <div className="flex gap-1 justify-center">
                                <button type="button" title="Approuver"
                                  onClick={() => { validateTransaction(tx.id, 'approved', authorName); toast.success('Transaction approuvée'); }}
                                  className="p-1 rounded text-emerald-600 hover:bg-emerald-50">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button type="button" title="Rejeter"
                                  onClick={() => { validateTransaction(tx.id, 'rejected', authorName); toast.error('Transaction rejetée'); }}
                                  className="p-1 rounded text-rose-600 hover:bg-rose-50">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddTransactionDialog open={showTx} onClose={() => setShowTx(false)} registerId={register.id} />
      <TransferDialog open={showTransfer} onClose={() => setShowTransfer(false)} fromId={register.id} />
    </div>
  );
}

// ─── Composant principal ───────────────────────────────────────────────────────

export function CashRegistersManagement() {
  const { cashRegisters, cashTransactions, currentUser, deleteCashRegister } = useStore();
  const churchId = currentUser?.churchId || '';

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editReg, setEditReg] = useState<CashRegister | null>(null);
  const [showTx, setShowTx] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [search, setSearch] = useState('');

  const registers = useMemo(() =>
    (cashRegisters || []).filter(r => r.churchId === churchId), [cashRegisters, churchId]);

  const filtered = useMemo(() =>
    registers.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase())),
    [registers, search]);

  const allTxs = useMemo(() =>
    (cashTransactions || []).filter(t => registers.some(r => r.id === t.registerId)),
    [cashTransactions, registers]);

  const totalBalance = registers.reduce((s, r) => s + r.balance, 0);
  const totalIn  = allTxs.filter(t => INCOME_TYPES.includes(t.type) && t.validationStatus !== 'rejected').reduce((s, t) => s + t.amount, 0);
  const totalOut = allTxs.filter(t => EXPENSE_TYPES.includes(t.type) && t.validationStatus !== 'rejected').reduce((s, t) => s + t.amount, 0);
  const pendingCount = allTxs.filter(t => t.validationStatus === 'pending').length;
  const alerts = registers.filter(r => r.alertThreshold != null && r.balance <= r.alertThreshold);

  const selectedRegister = selectedId ? registers.find(r => r.id === selectedId) : null;

  if (selectedRegister) {
    return <div className="p-6"><RegisterDetail register={selectedRegister} onBack={() => setSelectedId(null)} /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="w-7 h-7 text-emerald-600" />Gestion des Caisses
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{registers.length} caisse{registers.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowTransfer(true)}>
            <ArrowLeftRight className="w-4 h-4 mr-1" />Transférer
          </Button>
          <Button variant="outline" onClick={() => setShowTx(true)}>
            <Coins className="w-4 h-4 mr-1" />Nouvelle transaction
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => { setEditReg(null); setShowCreate(true); }}>
            <Plus className="w-4 h-4 mr-1" />Nouvelle caisse
          </Button>
        </div>
      </div>

      {/* Alertes solde bas */}
      {alerts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700 font-semibold mb-2">
            <AlertTriangle className="w-5 h-5" />Alertes de solde bas ({alerts.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {alerts.map(r => (
              <button key={r.id} type="button" onClick={() => setSelectedId(r.id)}
                className="text-sm text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg transition-colors">
                {r.name} : {fmt(r.balance)} / seuil {fmt(r.alertThreshold!)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Résumé KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Wallet,       label: 'Solde total',   value: fmt(totalBalance), color: 'text-slate-900',   bg: 'bg-emerald-50' },
          { icon: TrendingUp,   label: 'Total entrées', value: fmt(totalIn),      color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { icon: TrendingDown, label: 'Total sorties', value: fmt(totalOut),     color: 'text-rose-700',    bg: 'bg-rose-50'    },
          { icon: Clock,        label: 'En attente',    value: String(pendingCount), color: 'text-amber-700', bg: 'bg-amber-50'  },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-xl', bg)}><Icon className={cn('w-5 h-5', color)} /></div>
                <div><p className="text-xs text-slate-500">{label}</p><p className={cn('text-lg font-bold', color)}>{value}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <Input className="pl-9" placeholder="Rechercher une caisse..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Grille de caisses */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Landmark className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Aucune caisse</p>
          <p className="text-sm mt-1">Créez votre première caisse pour commencer</p>
          <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => { setEditReg(null); setShowCreate(true); }}>
            <Plus className="w-4 h-4 mr-1" />Créer une caisse
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(reg => {
            const txsReg = (cashTransactions || []).filter(t => t.registerId === reg.id);
            const regIn  = txsReg.filter(t => INCOME_TYPES.includes(t.type) && t.validationStatus !== 'rejected').reduce((s, t) => s + t.amount, 0);
            const regOut = txsReg.filter(t => EXPENSE_TYPES.includes(t.type) && t.validationStatus !== 'rejected').reduce((s, t) => s + t.amount, 0);
            const hasAlert = reg.alertThreshold != null && reg.balance <= reg.alertThreshold;
            const pendTxs  = txsReg.filter(t => t.validationStatus === 'pending').length;

            return (
              <div key={reg.id}
                className={cn('rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group',
                  !reg.isActive && 'opacity-60', hasAlert && 'border-amber-300')}
                onClick={() => setSelectedId(reg.id)}>
                <div className="h-2" style={{ backgroundColor: reg.color || '#10b981' }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{reg.name}</h3>
                      {reg.type && <span className="text-xs text-slate-500">{REG_TYPE_LABELS[reg.type]}</span>}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => e.stopPropagation()}>
                      <button type="button" className="p-1 rounded hover:bg-slate-100 text-slate-500" title="Modifier"
                        onClick={e => { e.stopPropagation(); setEditReg(reg); setShowCreate(true); }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 rounded hover:bg-rose-50 text-rose-500" title="Supprimer"
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm(`Supprimer "${reg.name}" ?`)) { deleteCashRegister(reg.id); toast.success('Caisse supprimée'); }
                        }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-0.5">Solde actuel</p>
                    <p className="text-2xl font-bold text-slate-900">{fmt(reg.balance)}</p>
                    {reg.initialBalance != null && reg.initialBalance > 0 && (
                      <p className="text-xs text-slate-400">Initial : {fmt(reg.initialBalance)}</p>
                    )}
                  </div>

                  <div className="flex gap-3 text-sm mb-3">
                    <div className="flex items-center gap-1 text-emerald-700">
                      <ArrowUpRight className="w-3.5 h-3.5" />{fmt(regIn)}
                    </div>
                    <div className="flex items-center gap-1 text-rose-700">
                      <ArrowDownRight className="w-3.5 h-3.5" />{fmt(regOut)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {!reg.isActive && <Badge variant="secondary" className="text-xs">Inactif</Badge>}
                    {reg.cashierName && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />{reg.cashierName}
                      </span>
                    )}
                    {pendTxs > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />{pendTxs} en attente
                      </span>
                    )}
                    {hasAlert && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />Solde bas
                      </span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">{txsReg.length} tx</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateRegisterDialog open={showCreate} onClose={() => { setShowCreate(false); setEditReg(null); }} register={editReg} />
      <AddTransactionDialog open={showTx} onClose={() => setShowTx(false)} />
      <TransferDialog open={showTransfer} onClose={() => setShowTransfer(false)} />
    </div>
  );
}
