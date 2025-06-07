// src/components/ToolCard.tsx
export function ToolCard({ name }: { name: string }) {
  return (
    <div className="bg-background p-3 rounded-md shadow-sm hover:bg-muted cursor-pointer transition-colors border border-border">
      <p className="font-medium text-foreground">{name}</p>
    </div>
  );
}
