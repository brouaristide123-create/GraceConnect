import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

import { useStore } from '../lib/store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ParcoursPage() {
  const { members, children, churches } = useStore();
  const [view, setView] = React.useState<'form' | 'document'>('form');
  const [docType, setDocType] = React.useState('pre-inscription');
  const [matricule, setMatricule] = React.useState('');
  const [error, setError] = React.useState('');
  const [foundPerson, setFoundPerson] = React.useState<any>(null);

  const handleApercu = () => {
    if (!matricule) {
      setError('Veuillez entrer un matricule');
      return;
    }

    const person = [...members, ...children].find(
      p => p.matricule?.toLowerCase() === matricule.toLowerCase()
    );

    if (person) {
      setFoundPerson(person);
      setError('');
      setView('document');
    } else {
      setError('Matricule non trouvé');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (view === 'document') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4 print:p-0 print:bg-white">
        {/* CSS for Print - Ensuring Single A4 Page */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              background: white;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
            .print-container {
              box-shadow: none !important;
              margin: 0 !important;
              padding: 10mm !important;
              width: 210mm !important;
              height: 297mm !important;
              max-width: none !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              position: relative !important;
            }
          }
        ` }} />

        {/* Action buttons (hidden during print) */}
        <div className="w-full max-w-4xl mb-6 flex justify-between no-print">
          <Button 
            variant="ghost" 
            className="text-slate-600 hover:text-slate-900 gap-2 bg-white shadow-sm border border-slate-200"
            onClick={() => setView('form')}
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à la saisie
          </Button>

          <Button 
            className="bg-[#1a365d] hover:bg-[#1e447a] text-white gap-2 shadow-sm"
            onClick={handlePrint}
          >
            <Printer className="w-5 h-5" />
            Imprimer la fiche (A4)
          </Button>
        </div>

        {docType === 'parcours' ? (
          /* The Fiche Cursus Membre Document */
          <div className="w-full max-w-[800px] bg-white shadow-2xl p-[40px] font-sans text-slate-900 relative overflow-hidden text-[11px] print-container">
            {/* Header matching screenshot */}
            <div className="flex justify-between items-start mb-6 print:mb-4">
              <div className="text-center w-5/12">
                <p className="font-black text-[12px] leading-tight">REPUBLIQUE DE COTE D'IVOIRE</p>
                <p className="font-black text-[10px] italic">Union - Discipline - Travail</p>
                <div className="w-full border-b border-dotted border-slate-400 my-1"></div>
                <div className="mt-2 flex justify-center">
                   <img src="https://api.dicebear.com/7.x/initials/svg?seed=CIV&backgroundColor=transparent" className="h-14 contrast-125" alt="coat of arms" />
                </div>
              </div>
              <div className="text-center w-5/12">
                <p className="font-black text-[11px] leading-tight text-right uppercase">COMMUNAUTÉ CHRÉTIENNE ÉGLISE CONNECT</p>
                <p className="font-black text-[10px] text-right italic">Vision - Foi - Transformation</p>
                <div className="w-full border-b border-dotted border-slate-400 my-1"></div>
                <div className="mt-2 flex justify-end items-center gap-2">
                   <div className="text-left">
                      <p className="font-black text-xs tracking-tighter leading-none text-blue-600">EGLISE</p>
                      <p className="font-black text-xs tracking-tighter leading-none text-cyan-500">CONNECT</p>
                   </div>
                   <div className="text-blue-600">
                      <img src="https://api.dicebear.com/7.x/initials/svg?seed=EC&backgroundColor=transparent" className="w-10 h-10 border-2 border-blue-600 rounded-lg p-1" alt="logo" />
                   </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-6 print:mb-4">
              <h1 className="text-2xl font-black border-y-2 border-slate-900 py-1.5 uppercase tracking-wide print:text-xl">FICHE CURSUS MEMBRE</h1>
              <p className="text-[10px] italic mt-1 text-slate-500">Source : Base de données des membres de l'église</p>
            </div>

            <div className="flex justify-between mb-8 print:mb-4">
              <div className="w-24 text-left">
                 <div className="bg-slate-100 p-1 mb-1">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CURSUS-${foundPerson.matricule}`} className="w-full h-auto grayscale" alt="qr" />
                 </div>
                 <p className="text-[8px] font-bold">N° RECU : EC {foundPerson.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-center flex-1">
                 <p className="text-[10px] font-black uppercase text-slate-500">IDENTIFIANT MEMBRE</p>
                 <p className="text-4xl font-black text-rose-600 tracking-tighter print:text-3xl">{foundPerson.matricule}</p>
              </div>
              <div className="w-32 h-36 border border-slate-300 p-1 flex items-center justify-center bg-white shadow-sm overflow-hidden print:h-28 print:w-28">
                  <img src={foundPerson.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${foundPerson.id}`} alt="photo" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Member Info */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-1 mb-6 print:mb-4 text-[10px]">
              <div className="space-y-1">
                {[
                  { l: 'Nom complet :', v: foundPerson.lastName },
                  { l: 'Prénom(s) :', v: foundPerson.firstName },
                  { l: 'Genre :', v: foundPerson.gender === 'M' ? 'MASCULIN' : 'FÉMININ' },
                  { l: 'Date de naissance :', v: foundPerson.birthDate ? format(new Date(foundPerson.birthDate), 'dd/MM/yyyy') : '-' },
                  { l: 'Lieu de naissance :', v: foundPerson.placeOfBirth || '-' },
                  { l: 'Téléphone :', v: foundPerson.phone || foundPerson.mainPhone || '-' },
                  { l: 'Adresse :', v: foundPerson.address || '-' },
                ].map((row, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-32 text-slate-600 font-bold">{row.l}</div>
                    <div className="flex-1 font-black text-slate-900 uppercase">{row.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full h-[2px] bg-emerald-800 mb-6 print:mb-4"></div>

            {/* Spiritual Info Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-1 mb-8 print:mb-4 text-[10px]">
               <div className="space-y-1">
                 {[
                   { l: 'Date de conversion :', v: foundPerson.conversionDate ? format(new Date(foundPerson.conversionDate), 'dd/MM/yyyy') : '-' },
                   { l: 'Baptisé(e) :', v: foundPerson.isBaptized ? 'OUI' : 'NON' },
                   { l: 'Date de baptême :', v: foundPerson.baptismDate ? format(new Date(foundPerson.baptismDate), 'dd/MM/yyyy') : '-' },
                   { l: 'Ancienne église :', v: foundPerson.formerChurch || '-' },
                 ].map((row, i) => (
                   <div key={i} className="flex gap-4">
                     <div className="w-36 text-slate-600 font-bold">{row.l}</div>
                     <div className="flex-1 font-black text-slate-900 uppercase">{row.v}</div>
                   </div>
                 ))}
               </div>
               <div className="space-y-1">
                 {[
                   { l: 'Département / Ministère :', v: foundPerson.groups?.join(', ') || '-' },
                   { l: 'Cellule / Groupe :', v: foundPerson.cellGroup || '-' },
                   { l: 'Statut :', v: foundPerson.status === 'active' ? 'MEMBRE ACTIF' : 'INACTIF' },
                   { l: 'Eglise Locale :', v: churches.find(c => c.id === foundPerson.churchId)?.name || 'EGLISE CONNECT' },
                 ].map((row, i) => (
                   <div key={i} className="flex gap-4">
                     <div className="w-40 text-slate-600 font-bold">{row.l}</div>
                     <div className="flex-1 font-black text-slate-900 uppercase">{row.v}</div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Journey Table */}
            <table className="w-full border-collapse border border-slate-400 text-[9px] uppercase font-bold text-center mb-8 print:mb-4">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-400 p-2 w-16 print:p-1">ANNEE</th>
                  <th className="border border-slate-400 p-2 print:p-1">INTEGRATION</th>
                  <th className="border border-slate-400 p-2 print:p-1">ACTIVITES / SERVICES</th>
                  <th className="border border-slate-400 p-2 print:p-1">FORMATIONS SUIVIES</th>
                  <th className="border border-slate-400 p-2 print:p-1">NIVEAU SPIRITUEL</th>
                  <th className="border border-slate-400 p-2 print:p-1">OBSERVATIONS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { a: '2020', i: 'Nouveau membre', ac: 'Participation aux cultes', f: 'Classe nouveaux convertis', n: 'Débutant', o: '-' },
                  { a: '2021', i: 'Actif', ac: 'Chorale', f: 'Formation biblique 1', n: 'Intermédiaire', o: 'Assidu' },
                  { a: '2022', i: 'Actif', ac: 'Jeunesse', f: 'Formation biblique 2', n: 'Intermédiaire', o: 'Très engagé' },
                  { a: '2023', i: 'Responsable adjoint', ac: 'Organisation d\'événements', f: 'Leadership 1', n: 'Avancé', o: 'Responsable d\'équipe' },
                  { a: '2024', i: 'Responsable', ac: 'Service accueil', f: 'Leadership 2', n: 'Avancé', o: 'Bon leader' },
                  { a: '2025', i: 'Responsable', ac: 'Coordination jeunesse', f: 'Formation avancée', n: 'Avancé', o: 'Engagement remarquable' },
                  { a: '2026', i: 'Responsable', ac: 'Discipulat / Mentorat', f: 'École des leaders', n: 'Très avancé', o: 'En formation continue' },
                ].map((row, idx) => (
                  <tr key={idx} className="h-10 print:h-8">
                    <td className="border border-slate-400 p-1">{row.a}</td>
                    <td className="border border-slate-400 p-1">{row.i}</td>
                    <td className="border border-slate-400 p-1">{row.ac}</td>
                    <td className="border border-slate-400 p-1">{row.f}</td>
                    <td className="border border-slate-400 p-1">{row.n}</td>
                    <td className="border border-slate-400 p-1 font-medium">{row.o}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer Notes */}
            <div className="space-y-1 mb-10 print:mb-4">
               <p className="font-black text-[10px]">NOTE IMPORTANTE :</p>
               <ul className="list-disc pl-5 space-y-0.5 text-[9px] font-bold text-slate-800">
                  <li>Vérifier les informations du membre, elles paraîtront sur tous les documents officiels émis par l'église.</li>
                  <li>Pour toute correction, veuillez-vous adresser à votre responsable spirituel muni des pièces justificatives.</li>
                  <li>Toute modification de statut ou de département doit être validée par le bureau de l'église.</li>
                  <li>Ce document est strictement confidentiel et réservé à l'usage interne de l'église.</li>
               </ul>
            </div>

            {/* Signatures */}
            <div className="flex items-center justify-between px-10 mb-10 print:mb-4">
               <div className="text-center w-1/3">
                  <p className="font-black uppercase text-[10px]">MEMBRE</p>
                  <p className="text-[9px] mt-1 font-medium">Lu et approuvé le ....../......../...........</p>
                  <div className="mt-8 border-b border-slate-400 h-1 mx-4 print:mt-4"></div>
                  <p className="text-[8px] mt-1 italic text-slate-500">Signature</p>
               </div>
               
               <div className="w-20 h-20 rounded-full border-2 border-blue-100 flex items-center justify-center p-1 shadow-inner bg-slate-50/50 print:w-16 print:h-16">
                  <div className="w-full h-full border border-blue-600 rounded-full flex flex-col items-center justify-center relative overflow-hidden">
                     <span className="text-3xl text-blue-800 font-serif leading-none mt-1 print:text-xl">†</span>
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-[5px] font-black text-blue-900/40 uppercase whitespace-nowrap rotate-[-45deg] scale-150">EGLISE CONNECT</div>
                     </div>
                     <div className="flex flex-col items-center gap-0 mt-0.5">
                        <p className="text-[5px] font-black text-blue-800 leading-none">FOI - AMOUR</p>
                        <p className="text-[5px] font-black text-blue-800 leading-none">SERVICE</p>
                     </div>
                  </div>
               </div>

               <div className="text-center w-1/3">
                  <p className="font-black uppercase text-[10px]">RESPONSABLE SPIRITUEL</p>
                  <p className="text-[9px] mt-1 font-medium">Lu et approuvé le ....../......../...........</p>
                  <div className="mt-8 border-b border-slate-400 h-1 mx-4 print:mt-4"></div>
                  <p className="text-[8px] mt-1 italic text-slate-500">Signature et cachet</p>
               </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[8px] text-slate-400 font-bold uppercase tracking-widest print:pt-1">
               <p>Copyright EGLISE CONNECT 2026. Tous droits réservés.</p>
               <div className="flex gap-4 items-center italic font-mono lowercase tracking-normal">
                  <p>eglise-connect.net/fiche-cursus-membre</p>
                  <p>1/1</p>
               </div>
            </div>
          </div>
        ) : (
          /* The Fiche Pré-inscription Document */
          <div className="w-full max-w-[800px] bg-white shadow-2xl p-[40px] font-sans text-slate-900 relative overflow-hidden text-[11px] print-container">
            {/* Header matching screenshot */}
            <div className="flex justify-between items-start mb-6 print:mb-2">
              <div className="text-center w-1/2">
                <p className="font-black text-[12px] leading-tight text-left">EGLISE CONNECT</p>
                <p className="font-black text-[10px] text-left uppercase">Plateforme de gestion des eglises</p>
                <div className="w-full border-b border-dotted border-slate-400 my-1"></div>
                <p className="font-black text-[10px] leading-tight text-left">DIRECTION DES MINISTERES, DE L'ADMINISTRATION<br/>ET DU SUIVI DES MEMBRES</p>
                <div className="mt-4 flex justify-start items-center gap-2 print:mt-1">
                   <div className="text-blue-600 flex items-center gap-1">
                      <div className="w-10 h-10 bg-white border-2 border-blue-600 rounded-lg flex items-center justify-center p-1 print:w-8 print:h-8">
                        <img src="https://api.dicebear.com/7.x/initials/svg?seed=EC&backgroundColor=transparent" className="w-full h-full" alt="logo" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-xs tracking-tighter leading-none text-blue-600 print:text-[10px]">EGLISE</p>
                        <p className="font-black text-xs tracking-tighter leading-none text-cyan-500 print:text-[10px]">CONNECT</p>
                      </div>
                   </div>
                </div>
              </div>
              <div className="text-center w-1/2">
                <p className="font-black text-[12px] text-right">REPUBLIQUE DE LA FOI</p>
                <div className="w-full border-b border-dotted border-slate-400 my-1"></div>
                <p className="font-black text-[10px] text-right">Unité - Amour - Sainteté</p>
                <div className="mt-4 flex justify-end print:mt-1">
                   <div className="w-20 h-20 rounded-full border-2 border-slate-900 flex items-center justify-center p-1.5 shadow-xl bg-white print:w-12 print:h-12">
                      <div className="w-full h-full border border-slate-900 rounded-full flex items-center justify-center bg-[#1a365d] text-white">
                         <span className="text-4xl font-serif print:text-2xl">†</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Banner */}
            <div className="bg-[#D34D00] text-white text-center py-2 mb-6 print:py-1 print:mb-3">
              <h2 className="text-xl font-black uppercase tracking-widest print:text-lg">FICHE D'INSCRIPTION MEMBRE</h2>
            </div>

            {/* Year and Matricule */}
            <div className="text-center space-y-2 mb-8 print:mb-3 print:space-y-1">
              <p className="font-black text-[13px] print:text-[11px]">ANNEE CHRETIENNE 2025-2026</p>
              <div className="flex justify-between items-end">
                <div className="text-left w-24">
                   <div className="bg-slate-100 p-1 mb-1 shadow-sm">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EC${foundPerson.matricule}`} className="w-full h-auto grayscale" alt="qr" />
                   </div>
                   <p className="text-[8px] font-bold">N° RECU : EC {foundPerson.id.substring(0, 8).toUpperCase()}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black italic uppercase text-slate-500 print:text-[8px]">NUMERO DE MEMBRE</p>
                   <p className="text-5xl font-black text-[#D34D00] tracking-tighter print:text-4xl">{foundPerson.matricule}</p>
                </div>
                <div className="w-24 text-center">
                   <div className="bg-cyan-500 text-white rounded p-1 mb-1 font-black text-lg flex flex-col items-center shadow-lg shadow-cyan-500/20 print:text-sm">
                      <img src="https://api.dicebear.com/7.x/initials/svg?seed=WAVE&backgroundColor=%2300BFFF" className="h-8 mb-1 print:h-5" alt="wave" />
                      <span className="text-[10px] lowercase leading-none print:text-[8px]">wave</span>
                   </div>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="grid grid-cols-4 gap-x-4 gap-y-1 border-t border-slate-200 pt-4 mb-2 print:pt-2 print:mb-1">
              <div className="font-bold text-slate-600">Nom complet :</div>
              <div className="font-black uppercase">{foundPerson.lastName}</div>
              <div className="col-span-2 row-span-7 flex justify-end">
                 <div className="w-32 h-32 border border-slate-200 shadow-xl overflow-hidden bg-white p-1 print:w-24 print:h-24">
                    <img src={foundPerson.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${foundPerson.id}`} className="w-full h-full object-cover grayscale" alt="photo" />
                 </div>
              </div>
              <div className="font-bold text-slate-600">Prénom(s) :</div>
              <div className="font-black uppercase">{foundPerson.firstName}</div>
              <div className="font-bold text-slate-600">Date de naissance :</div>
              <div className="font-black uppercase">{foundPerson.birthDate ? format(new Date(foundPerson.birthDate), 'dd/MM/yyyy') : '-'}</div>
              <div className="font-bold text-slate-600">Lieu de naissance :</div>
              <div className="font-black uppercase text-slate-900 leading-tight">{foundPerson.placeOfBirth || '-'}</div>
              <div className="font-bold text-slate-600">Genre :</div>
              <div className="font-black uppercase">{foundPerson.gender === 'M' ? 'MASCULIN' : 'FEMININ'}</div>
              <div className="font-bold text-slate-600">Statut matrimonial :</div>
              <div className="font-black uppercase leading-tight">{foundPerson.maritalStatus || 'CELIBATAIRE'}</div>
              <div className="font-bold text-slate-600">Statut de membre :</div>
              <div className="font-black uppercase text-blue-600 tracking-tight">MEMBRE CERTIFIÉ</div>
            </div>

            <div className="w-full h-[1px] bg-emerald-600 mb-4 print:mb-2"></div>

            {/* Church Details */}
            <div className="space-y-1 relative">
               {/* Background Watermark */}
               <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <div className="text-[140px] font-black -rotate-12 border-8 border-blue-900 rounded-full w-[400px] h-[400px] flex items-center justify-center print:w-[300px] print:h-[300px] print:text-[100px]">†</div>
               </div>

               {[
                 { l: 'Eglise locale :', v: churches.find(c => c.id === foundPerson.churchId)?.name || 'EGLISE CONNECT' },
                 { l: 'Département/Ministère :', v: foundPerson.groups?.join(', ') || '-' },
                 { l: 'Adresse :', v: foundPerson.address || '-' },
                 { l: 'Téléphone :', v: foundPerson.phone || foundPerson.mainPhone || '-' },
                 { l: 'Email :', v: foundPerson.email || '-' },
                 { l: 'Date d\'inscription :', v: foundPerson.joinedAt ? format(new Date(foundPerson.joinedAt), 'dd MMMM yyyy HH:mm:ss', { locale: fr }).toUpperCase() : '-' },
                 { l: 'Enregistré par :', v: 'SYSTÈME EGLISE CONNECT' },
                 { l: 'Niveau d\'engagement :', v: foundPerson.engagementLevel === 'leader' ? 'LEADER' : 'MEMBRE ACTIF' },
                 { l: 'Numéro d\'identification :', v: foundPerson.matricule },
               ].map((row, i) => (
                 <div key={i} className="flex gap-4 border-b border-slate-50 py-0.5 print:py-0">
                   <div className="w-44 text-slate-500 font-bold print:w-36"> {row.l}</div>
                   <div className="flex-1 uppercase font-black text-slate-900 print:text-[10px]">{row.v}</div>
                 </div>
               ))}

               <div className="flex justify-start items-center gap-20 border border-slate-100 bg-slate-50/30 p-2 mt-4 text-[10px] print:mt-2 print:p-1">
                  <div className="flex items-center gap-2">
                     <span className="text-slate-500 font-bold">Année d'inscription :</span>
                     <span className="font-black text-slate-900">2025-2026</span>
                  </div>
               </div>
            </div>

            {/* Status bar */}
            <div className="bg-[#D34D00] text-white py-1.5 px-4 text-center font-bold text-[12px] mt-4 mb-4 print:mt-2 print:mb-2 print:py-1">
               Statut de la Fiche d'Inscription : En attente de validation
            </div>

            {/* Legal text */}
            <div className="text-[9px] leading-relaxed space-y-2 text-slate-700 italic print:text-[8px] print:space-y-1">
               <p>Ceci indique que vous êtes préinscrit(e) en ligne dans la base de données de notre église. Vous devez vous rendre dans votre église locale muni de ce reçu pour finaliser votre inscription. L'église locale procédera à la validation de votre inscription puis à votre intégration complète dans nos registres.</p>
               <p className="font-bold not-italic">Vous devrez fournir les pièces justificatives suivantes :</p>
               <ul className="list-disc pl-5 font-bold not-italic">
                  <li>Votre pièce d'identité ou attestation d'identité</li>
                  <li>Votre décision personnelle de suivre Jésus-Christ</li>
                  <li>Votre attestation de baptême (si déjà baptisé)</li>
                  <li>1 photo d'identité récente</li>
                  <li>Votre engagement à respecter la vision et les valeurs de l'église</li>
               </ul>
               <p>Si votre inscription est rejetée, veuillez-vous rapprocher de votre église locale pour plus d'informations. Toute fausse information peut entraîner l'annulation de votre inscription. Pour vérifier l'authenticité de cette fiche, veuillez scanner le QR Code ou visiter le site de l'église.</p>
            </div>

            {/* Signature Area */}
            <div className="mt-8 flex flex-col items-center text-center print:mt-2">
               <div className="w-16 h-16 rounded-full border border-blue-200 flex items-center justify-center relative mb-2 shadow-sm print:w-10 print:h-10 print:mb-1">
                  <div className="absolute inset-0 bg-blue-50/20 rounded-full flex items-center justify-center border border-blue-400 p-0.5">
                      <div className="w-full h-full border border-blue-400 rounded-full flex items-center justify-center">
                         <span className="text-3xl text-blue-800 font-serif print:text-xl">†</span>
                      </div>
                  </div>
                  <img src="https://api.dicebear.com/7.x/initials/svg?seed=STAMP&backgroundColor=transparent" className="w-10 h-10 grayscale opacity-40 print:w-6 print:h-6" alt="stamp" />
               </div>
               <p className="font-black text-[10px] uppercase text-slate-900 leading-none print:text-[8px]">PASTEUR MARC KOUADIO</p>
               <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-tighter print:text-[7px]">Responsable de l'Eglise Locale</p>
            </div>

            <p className="text-center text-[7px] text-slate-400 mt-8 print:mt-2">
               Copyright EGLISE CONNECT 2025. Tous droits réservés. Ce document est confidentiel et non cessible.
            </p>

            <div className="mt-6 pt-2 border-t border-slate-100 flex justify-between items-center text-[7px] text-slate-400 font-mono italic print:mt-2 print:pt-1">
               <p>eglise-connect.net/inscription-membre</p>
               <p>1/1</p>
            </div>
          </div>
        )}
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Back button */}
      <div className="fixed top-8 left-8">
        <Link to="/">
          <Button variant="ghost" className="text-slate-600 hover:text-slate-900 gap-2">
            <ArrowLeft className="w-5 h-5" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border-none"
      >
        {/* Header matching screenshot */}
        <div className="bg-[#1a365d] p-8 text-center text-white space-y-1">
          <h2 className="text-3xl font-black tracking-tighter uppercase">EGLISE CONNECT</h2>
          <p className="text-sm font-medium opacity-90">Documents et Editions</p>
        </div>

        <div className="p-8 space-y-8 font-sans">
          {/* Document selection */}
          <div className="space-y-3">
            <label className="text-[15px] font-black text-slate-800 tracking-tight">Choisissez le type de document à éditer</label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger className="h-14 bg-white border-slate-200 rounded-xl text-slate-600 text-base focus:ring-2 focus:ring-[#FF9500]/20 transition-all">
                <SelectValue placeholder="Sélectionner un document" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pre-inscription" className="py-3">Fiche Pré-inscription</SelectItem>
                <SelectItem value="parcours" className="py-3">Fiche Parcours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Matricule input */}
          <div className="space-y-3">
            <label className="text-[15px] font-black text-slate-800 tracking-tight">Entrez votre numéro matricule</label>
            <Input 
              placeholder="Votre matricule" 
              value={matricule}
              onChange={(e) => {
                setMatricule(e.target.value);
                if (error) setError('');
              }}
              className={cn(
                "h-14 bg-white border-slate-200 rounded-xl text-slate-600 text-base placeholder:text-slate-300 italic focus:ring-2 focus:ring-[#FF9500]/20 transition-all",
                error && "border-red-500 focus:ring-red-500/20"
              )}
            />
            {error && <p className="text-red-500 text-xs font-bold mt-1 px-1">{error}</p>}
          </div>

          {/* Bottom section with Aperçu button */}
          <div className="pt-4 border-t border-slate-100 -mx-8 -mb-8 p-8 bg-slate-50/50">
            <Button 
              onClick={handleApercu}
              className="w-full h-14 bg-[#1a365d] hover:bg-[#1e447a] text-white text-xl font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all active:scale-[0.98]"
            >
              Aperçu
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Footer / Branding */}
      <p className="mt-8 text-slate-400 text-xs font-medium uppercase tracking-widest">
        © 2026 EGLISE CONNECT Platform
      </p>
    </div>
  );
}
