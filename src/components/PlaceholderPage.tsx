import React from 'react';
import { Card, CardContent } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500">{description}</p>
      </div>
      
      <Card className="border-none shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="text-xl font-medium text-slate-600 mb-2">Section en cours de développement</h2>
          <p className="text-slate-400 max-w-md">
            Cette fonctionnalité sera bientôt disponible. Elle vous permettra de gérer efficacement les {title.toLowerCase()} de votre ministère.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
