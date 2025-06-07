// src/components/ToolCard.tsx
export function ToolCard({ name }: { name: string }) {
  return (
    <div className="bg-background p-3 rounded-md shadow-md hover:bg-muted cursor-pointer transition-colors">
      <p className="font-medium text-foreground">{name}</p>
    </div>
  );
}
