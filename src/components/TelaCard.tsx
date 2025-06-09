// src/components/TelaCard.tsx
'use client';

import { Edit2, Trash2 } from 'lucide-react'; // Changed X to Trash2
import { IconButton } from './IconButton';

interface TelaCardProps {
  content: string;
  onEdit: () => void;
  onRemove: () => void;
}

export function TelaCard({ content, onEdit, onRemove }: TelaCardProps) {
  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden group">
      <div className="p-3 flex justify-between items-center bg-muted/30">
        <h4 className="text-sm font-semibold text-muted-foreground">Contexto para IA</h4>
        <div className="flex items-center space-x-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <IconButton ariaLabel="Editar Tela" onClick={onEdit} className="hover:text-foreground p-1"><Edit2 size={14} /></IconButton>
          <IconButton ariaLabel="Remover Tela" onClick={onRemove} className="hover:text-destructive p-1"><Trash2 size={14} /></IconButton> {/* Use Trash2 icon */}
        </div>
      </div>
      <div className="p-3">
        <p className="text-muted-foreground text-sm whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
}
