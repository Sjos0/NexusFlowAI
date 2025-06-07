// src/components/ToolCard.tsx
import { Trash2, Plus } from "lucide-react";
import type { Tool } from "@/lib/types";

interface ToolCardProps {
  name: string;
  subOptions: string[];
  onDelete: () => void;
  onAddSubOption: () => void;
}

export function ToolCard({ name, subOptions, onDelete, onAddSubOption }: ToolCardProps) {
  return (
    <div className="group bg-card p-3 rounded-md shadow-sm flex flex-col transition-colors hover:bg-muted border border-border cursor-default">
      <div className="flex justify-between items-start w-full">
        <p className="font-medium text-card-foreground group-hover:text-primary flex-1 mr-2">{name}</p>
        <div className="flex items-center space-x-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddSubOption();
            }} 
            className="hover:text-accent p-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-ring" 
            aria-label="Adicionar sub-opção"
            title="Adicionar sub-opção"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation(); 
              onDelete();
            }}
            className="hover:text-destructive p-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Deletar ferramenta"
            title="Deletar ferramenta"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {subOptions && subOptions.length > 0 && (
        <div className="mt-2 pt-2 pl-2 border-l-2 border-border/70 space-y-1">
          {subOptions.map((option, index) => (
            <p key={index} className="text-xs text-muted-foreground">{option}</p>
          ))}
        </div>
      )}
      {(!subOptions || subOptions.length === 0) && (
         <div className="mt-2 pt-2 pl-2 border-l-2 border-transparent">
            <p className="text-xs text-muted-foreground/70 italic">Sem sub-opções</p>
        </div>
      )}
    </div>
  );
}
