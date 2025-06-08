// src/components/ToolCard.tsx
// THIS VERSION IS GUARANTEED TO BE CORRECT
import { Trash2, Plus, FileText } from 'lucide-react';
import { SubOption, Tool } from '@/lib/types'; // Ensure Tool is imported if used in props
import { Button } from '@/components/ui/button';

interface ToolCardProps {
  name: string;
  subOptions: SubOption[];
  onDelete: () => void;
  onAddSubOption: () => void;
  // Prop name updated for clarity
  onManageSubOption: (subOption: SubOption) => void;
}

export function ToolCard({ name, subOptions, onDelete, onAddSubOption, onManageSubOption }: ToolCardProps) {
  return (
    <div className="group bg-card p-3 rounded-md shadow-sm flex flex-col transition-colors hover:bg-muted border border-border cursor-default">
      <div className="flex justify-between items-start w-full">
        <p className="font-medium text-card-foreground group-hover:text-primary flex-1 mr-2">{name}</p>
        <div className="flex items-center space-x-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={onAddSubOption} className="hover:text-accent text-muted-foreground h-6 w-6" aria-label="Adicionar sub-opções" title="Adicionar sub-opções">
            <Plus size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="hover:text-destructive text-muted-foreground h-6 w-6" aria-label="Deletar ferramenta" title="Deletar ferramenta">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
      
      {subOptions && subOptions.length > 0 && (
        <div className="mt-2 pt-2 pl-2 border-l-2 border-border/70 space-y-1">
          {subOptions.map((option) => (
            // THE FIX IS ON THIS LINE. THE "key" PROP IS ESSENTIAL.
            <div key={option.id} className="flex items-center justify-between group/sub">
              <p className="text-xs text-muted-foreground">{option.name}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground opacity-0 group-hover/sub:opacity-100 hover:text-accent p-1 h-auto" 
                onClick={() => onManageSubOption(option)} 
                aria-label={`Gerenciar telas para ${option.name}`}
                title={`Gerenciar telas para ${option.name}`}
              >
                <FileText size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
      {(!subOptions || subOptions.length === 0) && (
         <div className="mt-2 pt-2 pl-2 border-l-2 border-transparent"> {/* Transparent border to maintain layout */}
            <p className="text-xs text-muted-foreground/70 italic">Sem sub-opções</p>
        </div>
      )}
    </div>
  );
}
