// src/components/ToolCard.tsx
import { Trash2 } from "lucide-react";
import type { Tool } from "@/lib/types";

interface ToolCardProps {
  name: string;
  subOptions: string[];
  onDelete: () => void;
}

export function ToolCard({ name, subOptions, onDelete }: ToolCardProps) {
  return (
    <div className="group bg-card p-3 rounded-md shadow-sm flex flex-col transition-colors hover:bg-muted border border-border cursor-pointer">
      <div className="flex justify-between items-center w-full">
        <p className="font-medium text-card-foreground group-hover:text-primary">{name}</p>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Impede que qualquer evento de clique no card seja acionado
            onDelete();
          }}
          className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
          aria-label="Deletar ferramenta"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {subOptions && subOptions.length > 0 && (
        <div className="mt-2 pt-2 pl-2 border-l-2 border-border/70 space-y-1">
          {subOptions.map((option, index) => (
            <p key={index} className="text-xs text-muted-foreground">{option}</p>
          ))}
        </div>
      )}
    </div>
  );
}
