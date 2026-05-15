import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Church as ChurchIcon, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      const user = login(email, password);
      setLoading(false);
      if (user) {
        toast.success('Connexion réussie');
        if (user.role === 'super_admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error('Identifiants invalides');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Link to="/">
          <Button variant="ghost" className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour au site
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[450px]"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-church-gold rounded-3xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-xl shadow-church-gold/20 mb-4">
            G
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Grace-Connect</h1>
          <p className="text-slate-500">Connectez-vous à votre espace</p>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-xl">Connexion</CardTitle>
            <CardDescription>Entrez votre email ou identifiant pour accéder au tableau de bord.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-slate-700 font-medium ml-1">Email ou Identifiant</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="identifier" 
                    type="text" 
                    placeholder="Email ou ID (ex: 26)" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Button variant="link" className="px-0 h-auto text-xs text-church-gold">Mot de passe oublié ?</Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg mt-4" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Vous n'avez pas de compte ? <Button variant="link" className="p-0 h-auto text-church-gold font-bold">Inscrire votre église</Button></p>
        </div>
      </motion.div>
    </div>
  );
}
