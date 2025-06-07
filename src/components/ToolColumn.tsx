// src/components/ToolColumn.tsx
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface ToolColumnProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

export function ToolColumn({ title, icon: Icon, children }: ToolColumnProps) {
  return (
    <div className="flex flex-col bg-card rounded-lg p-4 w-full h-full">
      <div className="flex items-center mb-4">
        <Icon className="h-6 w-6 mr-3 text-accent-start" />
        <h2 className="font-headline text-xl font-semibold text-primary">{title}</h2>
      </div>
      <div className="flex-grow overflow-y-auto space-y-3 pr-2">
        {children}
      </div>
      <button className="mt-4 w-full bg-gradient-to-r from-accent-start to-accent-end text-primary-foreground font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity">
        Adicionar Ferramenta
      </button>
    </div>
  );
}
