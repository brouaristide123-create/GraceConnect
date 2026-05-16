import React, { useState, useMemo } from 'react';
import {
  Landmark, Plus, Trash2, ArrowUpRight, ArrowDownRight, ArrowLeftRight,
  History, TrendingUp, TrendingDown, Wallet, Edit2,
  FileText, Search, CheckCircle, XCircle, Clock, AlertTriangle,
  ChevronLeft, BarChart2, Settings, Eye, RefreshCw, Coins,
  ShoppingBag, CreditCard, HeartHandshake, Banknote, BookOpen,
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

// ─── Constants ────────────────────────────────────────────────────────────────

const INCOME_TYPES: CashTransaction['type'][] = ['income', 'donation', 'offering', 'tithe', 'contribution', 'event_payment', 'transfer_in'];
const EXPENSE_TYPES: CashTransaction['type'][] = ['expense', 'assistance', 'purchase', 'invoice', 'works', 'transfer_out'];

const TX_LABELS: Record<CashTransaction['type'], string> = {
  income: 'Entrée générale',
  expense: 'Dépense générale',
  donation: 'Don',
  offering: 'Offrande',
  tithe: 'Dîme',
  contribution: 'Contribution',
  event_payment: 'Paiement événement',
  assistance: 'Assistance',
  purchase: 'Achat',
  invoice: 'Facture',
  works: 'Travaux',
  transfer_in: 'Transfert reçu',
  transfer_out: 'Transfert envoyé',
};

const REGISTER_TYPE_LABELS: Record<NonNullable<CashRegister['type']>, string> = {
  principale: 'Caisse Principale',
  projet: 'Caisse Projet',
  departement: 'Caisse Département',
  evenement: 'Caisse Événement',
  assistance: 'Caisse Assistance',
  formation: 'Caisse Formation',
  autre: 'Autre',
};

const REGISTER_COLORS = [
  { label: 'Vert', value: '#10b981' },
  { label: 'Bleu', value: '#3b82f6' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Orange', value: '#f59e0b' },
  { label: 'Rouge', value: '#ef4444' },
  { label: 'Rose', value: '#ec4899' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Slate', value: '#64748b' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Sub-components ───────────────────────────────────────────────────────────

function TxBadge({ type }: { type: CashTransaction['type'] }) {
  const isIncome = INCOME_TYPES.includes(type);
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
      isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
      {isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {TX_LABELS[type] || type}
    </span>
  );
}

function ValidationBadge({ status }: { status?: CashTransaction['validationStatus'] }) {
  if (!status || status === 'approved') return null;
  if (status === 'pending') return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700"><Clock className="w-3 h-3" />En attente</span>;
  return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700"><XCircle className="w-3 h-3" />Rejeté</span>;
}

// ─── CreateRegisterDialog ─────────────────────────────────────────────────────

interface CreateRegisterDialogProps {
  open: boolean;
  onClose: () => void;
  register?: CashRegister | null;
}

function CreateRegisterDialog({ open, onClose, register }: CreateRegisterDialogProps) {
  const { addCashRegister, updateCashRegister, currentUser, members, departments, events } = useStore();
  const churchId = currentUser?.churchId || '';

  const blank = {
    name: '', description: '', type: 'principale' as CashRegister['type'],
    typeCustom: '', cashierId: '', cashierName: '', responsibleId: '', responsibleName: '',
    initialBalance: 0, isActive: true, allowExpenses: true, allowExternalContributions: false,
    color: '#10b981', icon: '', alertThreshold: 0,
    linkedType: 'general' as 'general' | 'event' | 'service' | 'department',
    linkedId: '', linkedName: '',
  };

  const [form, setForm] = useState(blank);

  React.useEffect(() => {
    if (open) {
      if (register) {
        setForm({
          name: register.name,
          description: register.description || '',
          type: register.type || 'principale',
          typeCustom: register.typeCustom || '',
          cashierId: register.cashierId || '',
          cashierName: register.cashierName || '',
          responsibleId: register.responsibleId || '',
          responsibleName: register.responsibleName || '',
          initialBalance: register.initialBalance || 0,
          isActive: register.isActive,
          allowExpenses: register.allowExpenses ?? true,
          allowExternalContributions: register.allowExternalContributions ?? false,
          color: register.color || '#10b981',
          icon: register.icon || '',
          alertThreshold: register.alertThreshold || 0,
          linkedType: (register.linkedTo?.type as 'general' | 'event' | 'service' | 'department') || 'general',
          linkedId: register.linkedTo?.id || '',
          linkedName: register.linkedTo?.name || '',
        });
      } else {
        setForm(blank);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, register]);

  const setF = (k: string, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));

  const churchMembers = (members || []).filter(m => m.churchId === churchId);
  const churchDepts = (departments || []).filter(d => d.churchId === churchId);
  const churchEvents = (events || []).filter(e => e.churchId === churchId);

  function handleSubmit() {
    if (!form.name.trim()) { toast.error('Le nom est obligatoire'); return; }
    const payload: Omit<CashRegister, 'id' | 'createdAt'> = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      churchId,
      type: form.type,
      typeCustom: form.type === 'autre' ? form.typeCustom : undefined,
      cashierId: form.cashierId || undefined,
      cashierName: form.cashierName || undefined,
      responsibleId: form.responsibleId || undefined,
      responsibleName: form.responsibleName || undefined,
      initialBalance: Number(form.initialBalance) || 0,
      balance: Number(form.initialBalance) || 0,
      isActive: form.isActive,
      allowExpenses: form.allowExpenses,
      allowExternalContributions: form.allowExternalContributions,
      color: form.color,
      icon: form.icon || undefined,
      alertThreshold: Number(form.alertThreshold) || undefined,
      linkedTo: form.linkedType !== 'general'
        ? { type: form.linkedType, id: form.linkedId || undefined, name: form.linkedName || undefined }
        : undefined,
    };
    if (register) {
      updateCashRegister(register.id, payload);
      toast.success('Caisse mise à jour');
    } else {
      addCashRegister(payload);
      toast.success('Caisse créée avec succès');
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-600" />
            {register ? 'Modifier la caisse' : 'Créer une nouvelle caisse'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          {/* Nom */}
          <div className="col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1 block">Nom de la caisse *</label>
            <Input value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Ex: Caisse Principale 2025" />
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={2}
              value={form.description}
              onChange={e => setF('description', e.target.value)}
              placeholder="Description optionnelle..."
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Type de caisse</label>
            <Select value={form.type || 'principale'} onValueChange={v => setF('type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(REGISTER_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom type */}
          {form.type === 'autre' && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Précisez le type</label>
              <Input value={form.typeCustom} onChange={e => setF('typeCustom', e.target.value)} placeholder="Ex: Caisse urgences" />
            </div>
          )}

          {/* Lien */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Liée à</label>
            <Select value={form.linkedType} onValueChange={v => setF('linkedType', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Général</SelectItem>
                <SelectItem value="department">Département</SelectItem>
                <SelectItem value="event">Événement</SelectItem>
                <SelectItem value="service">Culte/Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.linkedType === 'department' && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Département</label>
              <Select value={form.linkedId} onValueChange={v => {
                const dept = churchDepts.find(d => d.id === v);
                setF('linkedId', v); setF('linkedName', dept?.name || '');
              }}>
                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>
                  {churchDepts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {form.linkedType === 'event' && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Événement</label>
              <Select value={form.linkedId} onValueChange={v => {
                const ev = churchEvents.find(e => e.id === v);
                setF('linkedId', v); setF('linkedName', ev?.title || '');
              }}>
                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>
                  {churchEvents.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Caissier */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Caissier</label>
            <Select value={form.cashierId} onValueChange={v => {
              const m = churchMembers.find(x => x.id === v);
              setF('cashierId', v); setF('cashierName', m ? `${m.firstName} ${m.lastName}` : '');
            }}>
              <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun</SelectItem>
                {churchMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Responsable */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Responsable</label>
            <Select value={form.responsibleId} onValueChange={v => {
              const m = churchMembers.find(x => x.id === v);
              setF('responsibleId', v); setF('responsibleName', m ? `${m.firstName} ${m.lastName}` : '');
            }}>
              <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun</SelectItem>
                {churchMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Solde initial */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Solde initial (FCFA)</label>
            <Input type="number" min={0} value={form.initialBalance} onChange={e => setF('initialBalance', e.target.value)} placeholder="0" />
          </div>

          {/* Seuil alerte */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Seuil d'alerte (FCFA)</label>
            <Input type="number" min={0} value={form.alertThreshold} onChange={e => setF('alertThreshold', e.target.value)} placeholder="0" />
          </div>

          {/* Couleur */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Couleur</label>
            <div className="flex gap-2 flex-wrap">
              {REGISTER_COLORS.map(c => (
                <button key={c.value} title={c.label}
                  className={cn('w-7 h-7 rounded-full border-2 transition-transform hover:scale-110', form.color === c.value ? 'border-slate-800 scale-110' : 'border-transparent')}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setF('color', c.value)}
                  type="button"
                />
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="col-span-2 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="rounded" checked={form.isActive} onChange={e => setF('isActive', e.target.checked)} />
              <span className="text-sm text-slate-700">Caisse active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="rounded" checked={form.allowExpenses} onChange={e => setF('allowExpenses', e.target.checked)} />
              <span className="text-sm text-slate-700">Autoriser les dépenses</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="rounded" checked={form.allowExternalContributions} onChange={e => setF('allowExternalContributions', e.target.checked)} />
              <span className="text-sm text-slate-700">Contributions externes</span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}>
            {register ? 'Enregistrer' : 'Créer la caisse'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── AddTransactionDialog ─────────────────────────────────────────────────────

interface AddTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  registerId?: string;
}

function AddTransactionDialog({ open, onClose, registerId }: AddTransactionDialogProps) {
  const { addCashTransaction, cashRegisters, currentUser } = useStore();
  const churchId = currentUser?.churchId || '';

  const blank = {
    registerId: registerId || '',
    txType: 'income' as CashTransaction['type'],
    amount: '',
    description: '',
    category: '',
    paymentMethod: 'Espèces' as CashTransaction['paymentMethod'],
    sourceOrBeneficiary: '',
    notes: '',
    attachmentType: '' as CashTransaction['attachmentType'] | '',
    requireValidation: false,
    date: new Date().toISOString().slice(0, 16),
  };

  const [form, setForm] = useState(blank);
  React.useEffect(() => {
    if (open) setForm({ ...blank, registerId: registerId || '' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, registerId]);

  const setF = (k: string, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));

  const registers = (cashRegisters || []).filter(r => r.churchId === churchId && r.isActive);

  const INCOME_TX_OPTS: { value: CashTransaction['type']; label: string }[] = [
    { value: 'income', label: 'Entrée générale' },
    { value: 'tithe', label: 'Dîme' },
    { value: 'offering', label: 'Offrande' },
    { value: 'donation', label: 'Don' },
    { value: 'contribution', label: 'Contribution' },
    { value: 'event_payment', label: 'Paiement événement' },
  ];

  const EXPENSE_TX_OPTS: { value: CashTransaction['type']; label: string }[] = [
    { value: 'expense', label: 'Dépense générale' },
    { value: 'purchase', label: 'Achat' },
    { value: 'invoice', label: 'Facture' },
    { value: 'works', label: 'Travaux' },
    { value: 'assistance', label: 'Assistance' },
  ];

  const isIncome = INCOME_TYPES.includes(form.txType);

  function handleSubmit() {
    if (!form.registerId) { toast.error('Choisissez une caisse'); return; }
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Montant invalide'); return; }
    if (!form.description.trim()) { toast.error('Description obligatoire'); return; }

    const selectedRegister = registers.find(r => r.id === form.registerId);
    if (!isIncome && selectedRegister && !selectedRegister.allowExpenses) {
      toast.error('Cette caisse n\'autorise pas les dépenses');
      return;
    }

    addCashTransaction({
      registerId: form.registerId,
      type: form.txType,
      amount: Number(form.amount),
      description: form.description.trim(),
      category: form.category || TX_LABELS[form.txType],
      paymentMethod: form.paymentMethod,
      date: new Date(form.date).toISOString(),
      authorId: currentUser?.id,
      authorName: currentUser?.name,
      sourceOrBeneficiary: form.sourceOrBeneficiary || undefined,
      notes: form.notes || undefined,
      attachmentType: (form.attachmentType as CashTransaction['attachmentType']) || undefined,
      validationStatus: form.requireValidation ? 'pending' : 'approved',
    });

    toast.success('Transaction enregistrée');
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600" />
            Nouvelle transaction
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2">
          {/* Caisse */}
          {!registerId && (
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Caisse *</label>
              <Select value={form.registerId} onValueChange={v => setF('registerId', v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {registers.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Flux */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Flux</label>
            <div className="flex gap-2">
              <button type="button"
                className={cn('flex-1 py-2 rounded-lg text-sm font-medium border transition-colors', isIncome ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-white border-slate-200 text-slate-600')}
                onClick={() => setF('txType', 'income')}>
                <ArrowUpRight className="w-4 h-4 inline mr-1" />Entrée
              </button>
              <button type="button"
                className={cn('flex-1 py-2 rounded-lg text-sm font-medium border transition-colors', !isIncome ? 'bg-rose-50 border-rose-400 text-rose-700' : 'bg-white border-slate-200 text-slate-600')}
                onClick={() => setF('txType', 'expense')}>
                <ArrowDownRight className="w-4 h-4 inline mr-1" />Sortie
              </button>
            </div>
          </div>

          {/* Type précis */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Catégorie *</label>
            <Select value={form.txType} onValueChange={v => setF('txType', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(isIncome ? INCOME_TX_OPTS : EXPENSE_TX_OPTS).map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Montant */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Montant (FCFA) *</label>
            <Input type="number" min={1} value={form.amount} onChange={e => setF('amount', e.target.value)} placeholder="0" />
          </div>

          {/* Mode paiement */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Mode de paiement</label>
            <Select value={form.paymentMethod} onValueChange={v => setF('paymentMethod', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['Espèces', 'Mobile Money', 'Wave', 'Djamo', 'Virement', 'Carte', 'Cash', 'Bank'] as const).map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1 block">Description *</label>
            <Input value={form.description} onChange={e => setF('description', e.target.value)} placeholder="Objet de la transaction..." />
          </div>

          {/* Source / bénéficiaire */}
          <div className="col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1 block">{isIncome ? 'Source / Donateur' : 'Bénéficiaire / Fournisseur'}</label>
            <Input value={form.sourceOrBeneficiary} onChange={e => setF('sourceOrBeneficiary', e.target.value)} placeholder="Nom ou entité..." />
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Date</label>
            <Input type="datetime-local" value={form.date} onChange={e => setF('date', e.target.value)} />
          </div>

          {/* Pièce jointe */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Type de justificatif</label>
            <Select value={form.attachmentType} onValueChange={v => setF('attachmentType', v)}>
              <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun</SelectItem>
                <SelectItem value="receipt">Reçu</SelectItem>
                <SelectItem value="invoice">Facture</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1 block">Notes</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={2}
              value={form.notes}
              onChange={e => setF('notes', e.target.value)}
              placeholder="Notes supplémentaires..."
            />
          </div>

          {/* Validation */}
          {!isIncome && (
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="rounded" checked={form.requireValidation} onChange={e => setF('requireValidation', e.target.checked)} />
                <span className="text-sm text-slate-700">Soumettre à validation (Pasteur/Trésorier)</span>
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── TransferDialog ────────────────────────────────────────────────────────────

interface TransferDialogProps { open: boolean; onClose: () => void; fromId?: string }

function TransferDialog({ open, onClose, fromId }: TransferDialogProps) {
  const { transferBetweenRegisters, cashRegisters, currentUser } = useStore();
  const churchId = currentUser?.churchId || '';
  const registers = (cashRegisters || []).filter(r => r.churchId === churchId && r.isActive);

  const [form, setForm] = useState({ fromId: fromId || '', toId: '', amount: '', motif: '' });
  React.useEffect(() => { if (open) setForm({ fromId: fromId || '', toId: '', amount: '', motif: '' }); }, [open, fromId]);
  const setF = (k: string, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));

  function handleSubmit() {
    if (!form.fromId || !form.toId) { toast.error('Sélectionnez les deux caisses'); return; }
    if (form.fromId === form.toId) { toast.error('Les caisses doivent être différentes'); return; }
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Montant invalide'); return; }
    const src = registers.find(r => r.id === form.fromId);
    if (src && src.balance < Number(form.amount)) { toast.error('Solde insuffisant'); return; }
    transferBetweenRegisters(form.fromId, form.toId, Number(form.amount), form.motif, currentUser?.id, currentUser?.name);
    toast.success(`Transfert de ${fmt(Number(form.amount))} effectué`);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-blue-600" />
            Transfert entre caisses
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Caisse source</label>
            <Select value={form.fromId} onValueChange={v => setF('fromId', v)}>
              <SelectTrigger><SelectValue placeholder="De..." /></SelectTrigger>
              <SelectContent>
                {registers.filter(r => r.id !== form.toId).map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name} — {fmt(r.balance)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Caisse destination</label>
            <Select value={form.toId} onValueChange={v => setF('toId', v)}>
              <SelectTrigger><SelectValue placeholder="Vers..." /></SelectTrigger>
              <SelectContent>
                {registers.filter(r => r.id !== form.fromId).map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name} — {fmt(r.balance)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Montant (FCFA) *</label>
            <Input type="number" min={1} value={form.amount} onChange={e => setF('amount', e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Motif</label>
            <Input value={form.motif} onChange={e => setF('motif', e.target.value)} placeholder="Motif du transfert..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit}>Transférer</Button>
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

  const txs = useMemo(() => {
    return (cashTransactions || [])
      .filter(t => t.registerId === register.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cashTransactions, register.id]);

  const filtered = useMemo(() => {
    return txs.filter(t => {
      if (txFilter === 'income' && !INCOME_TYPES.includes(t.type)) return false;
      if (txFilter === 'expense' && !EXPENSE_TYPES.includes(t.type)) return false;
      if (txFilter === 'pending' && t.validationStatus !== 'pending') return false;
      if (txSearch && !t.description.toLowerCase().includes(txSearch.toLowerCase()) &&
          !(t.sourceOrBeneficiary || '').toLowerCase().includes(txSearch.toLowerCase())) return false;
      return true;
    });
  }, [txs, txFilter, txSearch]);

  const totalIn = txs.filter(t => INCOME_TYPES.includes(t.type) && t.validationStatus !== 'rejected').reduce((s, t) => s + t.amount, 0);
  const totalOut = txs.filter(t => EXPENSE_TYPES.includes(t.type) && t.validationStatus !== 'rejected').reduce((s, t) => s + t.amount, 0);
  const pending = txs.filter(t => t.validationStatus === 'pending').length;

  const canValidate = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  function handleDelete() {
    if (window.confirm(`Supprimer la caisse "${register.name}" ?`)) {
      deleteCashRegister(register.id);
      onBack();
      toast.success('Caisse supprimée');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Retour aux caisses</span>
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowTransfer(true)}>
            <ArrowLeftRight className="w-4 h-4 mr-1" />Transférer
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowTx(true)}>
            <Plus className="w-4 h-4 mr-1" />Transaction
          </Button>
          <Button size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Register header card */}
      <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: register.color || '#10b981' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="w-6 h-6 opacity-80" />
              <span className="text-lg font-bold">{register.name}</span>
              {!register.isActive && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Inactif</span>}
            </div>
            {register.type && <p className="text-white/70 text-sm">{REGISTER_TYPE_LABELS[register.type]}</p>}
            {register.description && <p className="text-white/70 text-sm mt-1">{register.description}</p>}
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm">Solde actuel</p>
            <p className="text-3xl font-bold">{fmt(register.balance)}</p>
          </div>
        </div>
        {register.alertThreshold && register.balance <= register.alertThreshold && (
          <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 text-sm">
            <AlertTriangle className="w-4 h-4" />
            Solde en dessous du seuil d'alerte ({fmt(register.alertThreshold)})
          </div>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-slate-500">Total entrées</span>
            </div>
            <p className="text-lg font-bold text-emerald-700">{fmt(totalIn)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
              <span className="text-xs text-slate-500">Total sorties</span>
            </div>
            <p className="text-lg font-bold text-rose-700">{fmt(totalOut)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <History className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-slate-500">Transactions</span>
            </div>
            <p className="text-lg font-bold text-slate-700">{txs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-slate-500">En attente</span>
            </div>
            <p className="text-lg font-bold text-amber-700">{pending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">Historique des transactions</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <Input className="pl-8 h-9 w-48" placeholder="Rechercher..." value={txSearch} onChange={e => setTxSearch(e.target.value)} />
              </div>
              <Select value={txFilter} onValueChange={v => setTxFilter(v as typeof txFilter)}>
                <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
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
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune transaction</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase">
                    <th className="text-left px-4 py-2">Date</th>
                    <th className="text-left px-4 py-2">Type</th>
                    <th className="text-left px-4 py-2">Description</th>
                    <th className="text-left px-4 py-2">Source/Bénéficiaire</th>
                    <th className="text-left px-4 py-2">Méthode</th>
                    <th className="text-right px-4 py-2">Montant</th>
                    <th className="text-center px-4 py-2">Statut</th>
                    {canValidate && <th className="text-center px-4 py-2">Actions</th>}
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
                        <td className="px-4 py-3 text-center">
                          <ValidationBadge status={tx.validationStatus} />
                          {(!tx.validationStatus || tx.validationStatus === 'approved') && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                              <CheckCircle className="w-3 h-3" />Validé
                            </span>
                          )}
                        </td>
                        {canValidate && (
                          <td className="px-4 py-3 text-center">
                            {tx.validationStatus === 'pending' && (
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => { validateTransaction(tx.id, 'approved', currentUser?.name || ''); toast.success('Transaction approuvée'); }}
                                  className="p-1 rounded text-emerald-600 hover:bg-emerald-50" title="Approuver">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => { validateTransaction(tx.id, 'rejected', currentUser?.name || ''); toast.error('Transaction rejetée'); }}
                                  className="p-1 rounded text-rose-600 hover:bg-rose-50" title="Rejeter">
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

// ─── Main Component ────────────────────────────────────────────────────────────

export function CashRegistersManagement() {
  const { cashRegisters, cashTransactions, currentUser, deleteCashRegister } = useStore();
  const churchId = currentUser?.churchId || '';

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editRegister, setEditRegister] = useState<CashRegister | null>(null);
  const [showTx, setShowTx] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [search, setSearch] = useState('');

  const registers = useMemo(() =>
    (cashRegisters || []).filter(r => r.churchId === churchId),
    [cashRegisters, churchId]
  );

  const filtered = useMemo(() =>
    registers.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase())),
    [registers, search]
  );

  const allTxs = useMemo(() =>
    (cashTransactions || []).filter(t => registers.some(r => r.id === t.registerId)),
    [cashTransactions, registers]
  );

  const totalBalance = registers.reduce((s, r) => s + r.balance, 0);
  const totalIn = allTxs.filter(t => INCOME_TYPES.includes(t.type) && t.validationStatus !== 'rejected').reduce((s, t) => s + t.amount, 0);
  const totalOut = allTxs.filter(t => EXPENSE_TYPES.includes(t.type) && t.validationStatus !== 'rejected').reduce((s, t) => s + t.amount, 0);
  const pendingCount = allTxs.filter(t => t.validationStatus === 'pending').length;
  const alerts = registers.filter(r => r.alertThreshold && r.balance <= r.alertThreshold);

  const selectedRegister = selectedId ? registers.find(r => r.id === selectedId) : null;

  if (selectedRegister) {
    return (
      <div className="p-6">
        <RegisterDetail register={selectedRegister} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="w-7 h-7 text-emerald-600" />
            Gestion des Caisses
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{registers.length} caisse{registers.length > 1 ? 's' : ''} enregistrée{registers.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowTransfer(true)}>
            <ArrowLeftRight className="w-4 h-4 mr-1" />Transférer
          </Button>
          <Button variant="outline" onClick={() => setShowTx(true)}>
            <Coins className="w-4 h-4 mr-1" />Nouvelle transaction
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setEditRegister(null); setShowCreate(true); }}>
            <Plus className="w-4 h-4 mr-1" />Nouvelle caisse
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700 font-semibold mb-2">
            <AlertTriangle className="w-5 h-5" />
            Alertes de solde bas ({alerts.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {alerts.map(r => (
              <button key={r.id} onClick={() => setSelectedId(r.id)}
                className="text-sm text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg transition-colors">
                {r.name}: {fmt(r.balance)} / seuil {fmt(r.alertThreshold!)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Solde total</p>
                <p className="text-lg font-bold text-slate-900">{fmt(totalBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total entrées</p>
                <p className="text-lg font-bold text-emerald-700">{fmt(totalIn)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-50">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total sorties</p>
                <p className="text-lg font-bold text-rose-700">{fmt(totalOut)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">En attente</p>
                <p className="text-lg font-bold text-amber-700">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <Input className="pl-9" placeholder="Rechercher une caisse..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Register grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Landmark className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Aucune caisse</p>
          <p className="text-sm mt-1">Créez votre première caisse pour commencer</p>
          <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" />Créer une caisse
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(reg => {
            const txsForReg = (cashTransactions || []).filter(t => t.registerId === reg.id);
            const regIn = txsForReg.filter(t => INCOME_TYPES.includes(t.type) && t.validationStatus !== 'rejected').reduce((s, t) => s + t.amount, 0);
            const regOut = txsForReg.filter(t => EXPENSE_TYPES.includes(t.type) && t.validationStatus !== 'rejected').reduce((s, t) => s + t.amount, 0);
            const hasAlert = reg.alertThreshold && reg.balance <= reg.alertThreshold;
            const pendingTxs = txsForReg.filter(t => t.validationStatus === 'pending').length;

            return (
              <div key={reg.id}
                className={cn('rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group',
                  !reg.isActive && 'opacity-60',
                  hasAlert && 'border-amber-300'
                )}
                onClick={() => setSelectedId(reg.id)}>
                {/* Color strip */}
                <div className="h-2" style={{ backgroundColor: reg.color || '#10b981' }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{reg.name}</h3>
                      {reg.type && (
                        <span className="text-xs text-slate-500">{REGISTER_TYPE_LABELS[reg.type]}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => e.stopPropagation()}>
                      <button className="p-1 rounded hover:bg-slate-100 text-slate-500"
                        title="Modifier"
                        onClick={e => { e.stopPropagation(); setEditRegister(reg); setShowCreate(true); }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 rounded hover:bg-rose-50 text-rose-500"
                        title="Supprimer"
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm(`Supprimer "${reg.name}" ?`)) {
                            deleteCashRegister(reg.id);
                            toast.success('Caisse supprimée');
                          }
                        }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-0.5">Solde actuel</p>
                    <p className="text-2xl font-bold text-slate-900">{fmt(reg.balance)}</p>
                    {reg.initialBalance !== undefined && reg.initialBalance > 0 && (
                      <p className="text-xs text-slate-400">Solde initial: {fmt(reg.initialBalance)}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-3 text-sm mb-3">
                    <div className="flex items-center gap-1 text-emerald-700">
                      <ArrowUpRight className="w-3.5 h-3.5" />{fmt(regIn)}
                    </div>
                    <div className="flex items-center gap-1 text-rose-700">
                      <ArrowDownRight className="w-3.5 h-3.5" />{fmt(regOut)}
                    </div>
                  </div>

                  {/* Footer badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!reg.isActive && <Badge variant="secondary" className="text-xs">Inactif</Badge>}
                    {reg.cashierName && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />{reg.cashierName}
                      </span>
                    )}
                    {pendingTxs > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />{pendingTxs} en attente
                      </span>
                    )}
                    {hasAlert && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />Solde bas
                      </span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">{txsForReg.length} tx</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <CreateRegisterDialog
        open={showCreate}
        onClose={() => { setShowCreate(false); setEditRegister(null); }}
        register={editRegister}
      />
      <AddTransactionDialog open={showTx} onClose={() => setShowTx(false)} />
      <TransferDialog open={showTransfer} onClose={() => setShowTransfer(false)} />
    </div>
  );
}
