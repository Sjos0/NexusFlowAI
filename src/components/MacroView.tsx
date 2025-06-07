// src/components/MacroView.tsx
import type { GeneratedPlan } from "@/lib/types";
import { Plus } from "lucide-react";

interface MacroViewProps {
  plan: GeneratedPlan;
}

const Section = ({ title, items, colorClass }: { title: string, items: string[], colorClass: string }) => (
  <div className={`rounded-lg text-primary-foreground font-bold ${colorClass}`}>
    <div className="flex justify-between items-center p-3">
      <h3 className="text-lg">{title}</h3>
      <Plus className="h-6 w-6" />
    </div>
    <div className="bg-background/40 p-3 font-normal text-sm rounded-b-lg text-foreground">
      {items && items.length > 0 ? (
        items.map((item, index) => <p key={index} className="mb-1 last:mb-0">{item}</p>)
      ) : (
        <p className="italic">Sem {title.toLowerCase()} definidos.</p>
      )}
    </div>
  </div>
);

export function MacroView({ plan }: MacroViewProps) {
  return (
    <div className="mt-6 bg-card p-4 rounded-lg space-y-4 shadow-md">
      <input 
        type="text" 
        defaultValue={plan.macroName}
        readOnly
        aria-label="Nome da Macro"
        className="w-full bg-transparent text-card-foreground text-xl font-headline border-b-2 border-border focus:border-accent focus:outline-none pb-1"
      />
      <p className="text-muted-foreground text-sm pt-2">{plan.explanation}</p>
      
      <div className="space-y-3 pt-2">
        <Section title="Gatilhos" items={plan.triggers} colorClass="bg-red-600" />
        <Section title="Ações" items={plan.actions} colorClass="bg-blue-600" />
        <Section title="Restrições" items={plan.constraints} colorClass="bg-green-600" />
      </div>
    </div>
  );
}
