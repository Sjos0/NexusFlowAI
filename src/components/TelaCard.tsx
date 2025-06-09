// src/components/TelaCard.tsx
'use client';

import { Edit2, X } from 'lucide-react';
import { IconButton } from './IconButton'; // Assuming IconButton exists

interface TelaCardProps {
  content: string;
  onEdit: () => void;
  onRemove: () => void;
}

export function TelaCard({ content, onEdit, onRemove }: TelaCardProps) {
  return (
    <div className="bg-background rounded-lg border border-slate-700 overflow-hidden group">
      <div className="p-3 flex justify-between items-center bg-slate-800">
        <h4 className="text-sm font-semibold text-muted-foreground">Contexto para IA</h4>
        <div className="flex items-center space-x-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <IconButton ariaLabel="Editar Tela" onClick={onEdit} className="hover:text-foreground"><Edit2 size={14} /></IconButton>
          <IconButton ariaLabel="Remover Tela" onClick={onRemove} className="hover:text-destructive"><X size={16} /></IconButton>
        </div>
      </div>
      <div className="p-3">
        <p className="text-muted-foreground text-sm whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
}
