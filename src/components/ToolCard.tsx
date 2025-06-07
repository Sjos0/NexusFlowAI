// src/components/ToolCard.tsx
import { Trash2 } from "lucide-react";

interface ToolCardProps {
  name: string;
  onDelete: () => void;
}

export function ToolCard({ name, onDelete }: ToolCardProps) {
  return (
    <div className="group bg-card p-3 rounded-md shadow-md flex justify-between items-center transition-colors hover:bg-muted border border-border cursor-pointer">
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
  );
}
