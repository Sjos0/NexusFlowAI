// src/components/ToolColumn.tsx
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ToolColumnProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  onAdd: () => void;
}

export function ToolColumn({ title, icon: Icon, children, onAdd }: ToolColumnProps) {
  return (
    <div className="flex flex-col bg-card rounded-lg p-4 w-full h-full shadow-md">
      <div className="flex items-center mb-4">
        <Icon className="h-6 w-6 mr-3 text-accent" />
        <h2 className="font-headline text-xl font-semibold text-primary">{title}</h2>
      </div>
      <div className="flex-grow overflow-y-auto space-y-3 pr-2">
        {children}
      </div>
      <Button 
        onClick={onAdd}
        className="mt-4 w-full font-bold"
      >
        Adicionar Ferramenta
      </Button>
    </div>
  );
}
