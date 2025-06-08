// src/components/VariableCard.tsx
import { Pencil, Trash2, Lock, Unlock } from 'lucide-react';
import { Variable } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VariableCardProps {
  variable: Variable;
  onEdit: () => void;
  onDelete: () => void;
  accentColor: string;
}

export function VariableCard({ variable, onEdit, onDelete, accentColor }: VariableCardProps) {
  return (
    <div 
      className="group bg-card p-3 rounded-lg shadow-md flex justify-between items-center border-t-4"
      style={{ borderColor: accentColor }}
    >
      <div className="flex-1 min-w-0 mr-2">
        <div className="flex items-center space-x-2">
            <p className="font-medium text-foreground truncate" title={variable.name}>{variable.name}</p>
            {variable.isSecure && <Lock size={14} className="text-muted-foreground flex-shrink-0" title="Variável Segura"/>}
        </div>
        <Badge variant="outline" className="mt-1 text-xs" style={{borderColor: accentColor, color: accentColor}}>
            {variable.type}
        </Badge>
      </div>
      <div className="flex items-center space-x-1 text-muted-foreground opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" onClick={onEdit} className="hover:text-accent text-muted-foreground h-7 w-7" aria-label="Editar variável" title="Editar variável">
          <Pencil size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete} className="hover:text-destructive text-muted-foreground h-7 w-7" aria-label="Deletar variável" title="Deletar variável">
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}
