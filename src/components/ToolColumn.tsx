// src/components/ToolColumn.tsx
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ToolColumnProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  onAdd: () => void;
  accentColor: string;
}

export function ToolColumn({ title, icon: Icon, children, onAdd, accentColor }: ToolColumnProps) {
  return (
    <div className="flex flex-col bg-card rounded-lg p-4 w-full h-full shadow-md border-border">
      <div className="flex items-center mb-4">
        <Icon className="h-6 w-6 mr-3" style={{ color: accentColor }} />
        <h2 className="font-headline text-xl font-semibold" style={{ color: accentColor }}>{title}</h2>
      </div>
      <div className="flex-grow overflow-y-auto space-y-3 pr-1 -mr-1">
        {children}
      </div>
      <Button 
        onClick={onAdd}
        className="mt-4 w-full font-bold"
        style={{ backgroundColor: accentColor }}
      >
        Adicionar Ferramenta
      </Button>
    </div>
  );
}
