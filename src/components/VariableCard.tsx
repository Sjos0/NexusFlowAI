// src/components/VariableCard.tsx
import { Pencil, Trash2 } from 'lucide-react';
import { Variable } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { IconButton } from './IconButton'; // Assuming IconButton is in the same directory or adjust path
import { memo } from 'react'; // Import memo

interface VariableCardProps {
  variable: Variable;
  onEdit: () => void;
  onDelete: () => void;
  accentColor: string;
}

const VariableCardComponent = ({ variable, onEdit, onDelete, accentColor }: VariableCardProps) => {
  return (
    <div
      className="group bg-card p-3 rounded-lg shadow-md flex justify-between items-center border-t-4"
      style={{ borderColor: accentColor }}
    >
      <div className="flex-1 min-w-0 mr-2">
        <div className="flex items-center space-x-2">
          <p className="font-medium text-foreground truncate" title={variable.name}>{variable.name}</p>
          {variable.isSecure && <IconButton ariaLabel='Variável Segura' className="text-muted-foreground h-5 w-5 cursor-default"><Trash2 size={14} /></IconButton>}
        </div>
        <Badge variant="outline" className="mt-1 text-xs" style={{ borderColor: accentColor, color: accentColor }}>
          {variable.type}
        </Badge>
      </div>
      <div className="flex items-center space-x-1 text-muted-foreground opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <IconButton onClick={onEdit} ariaLabel={`Editar variável ${variable.name}`} title={`Editar variável ${variable.name}`} className="hover:text-accent text-muted-foreground h-7 w-7">
          <Pencil size={16} />
        </IconButton>
        <IconButton onClick={onDelete} ariaLabel={`Deletar variável ${variable.name}`} title={`Deletar variável ${variable.name}`} className="hover:text-destructive text-muted-foreground h-7 w-7">
          <Trash2 size={16} />
        </IconButton>
      </div>
    </div>
  );
};

export const VariableCard = memo(VariableCardComponent);
