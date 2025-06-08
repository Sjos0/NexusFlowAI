// src/components/AutomationPlanView.tsx
import type { GeneratedPlan, PlanStep } from "@/lib/types";
import { motion } from 'framer-motion';
import { Zap, Target, ShieldCheck, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stepConfigMap: Record<PlanStep['type'], { color: string; icon: React.ElementType; badgeVariant: "default" | "secondary" | "destructive" | "outline" }> = {
  GATILHO: { color: 'border-red-500', icon: Zap, badgeVariant: "destructive" },
  AÇÃO: { color: 'border-blue-500', icon: Target, badgeVariant: "default" },
  RESTRIÇÃO: { color: 'border-green-500', icon: ShieldCheck, badgeVariant: "secondary" },
};

const StepCard = ({ step }: { step: PlanStep }) => {
  const config = stepConfigMap[step.type] || stepConfigMap['AÇÃO']; // Fallback to action if type is unexpected
  const Icon = config.icon;

  return (
    <Card className={`border-l-4 ${config.color} shadow-md`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon className="h-5 w-5 mr-3 text-muted-foreground" />
            <CardTitle className="text-lg text-foreground">{step.toolName}</CardTitle>
          </div>
          <Badge variant={config.badgeVariant} className="ml-2">{step.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-3 pt-0">
        {step.chosenSubOptions && step.chosenSubOptions.length > 0 && (
          <div>
            <h4 className="font-semibold text-muted-foreground mb-1">Opções Selecionadas:</h4>
            <div className="flex flex-wrap gap-1">
              {step.chosenSubOptions.map((opt, i) => (
                <Badge key={i} variant="outline" className="font-normal">{opt}</Badge>
              ))}
            </div>
          </div>
        )}
        <div>
          <h4 className="font-semibold text-muted-foreground mb-2">Passo a Passo da Configuração:</h4>
          <ul className="space-y-1.5">
            {step.detailedSteps.map((s, i) => (
              <li key={i} className="flex items-start">
                <ChevronRight className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0 text-accent" />
                <span className="text-foreground/90">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export function AutomationPlanView({ plan }: { plan: GeneratedPlan }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-6 bg-card p-4 sm:p-6 rounded-lg shadow-lg"
    >
      <h2 className="font-headline text-2xl sm:text-3xl font-bold text-primary mb-6 pb-2 border-b border-border">
        {plan.macroName}
      </h2>
      {plan.steps && plan.steps.length > 0 ? (
        <div className="space-y-6">
          {plan.steps.map((step, index) => <StepCard key={index} step={step} />)}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-4">Nenhum passo definido para este plano.</p>
      )}
    </motion.div>
  );
}
