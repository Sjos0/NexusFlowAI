// src/components/AutomationPlanView.tsx
import type { GeneratedPlan, PlanStep } from "@/lib/types";
import { motion } from 'framer-motion';
import { Zap, Target, ShieldCheck, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const stepConfigMap: Record<PlanStep['type'], { borderClass: string; icon: React.ElementType; badgeVariant: "default" | "secondary" | "destructive" | "outline" | null; iconColor: string }> = {
  GATILHO: { borderClass: 'border-destructive', icon: Zap, badgeVariant: "destructive", iconColor: "text-destructive" },
  AÇÃO: { borderClass: 'border-primary', icon: Target, badgeVariant: "default", iconColor: "text-primary" },
  RESTRIÇÃO: { borderClass: 'border-green-500', icon: ShieldCheck, badgeVariant: "secondary", iconColor: "text-green-500" }, // Using a direct color for restrictions as there isn't a direct semantic match in default shadcn theme variants like "success"
};

const StepCard = ({ step }: { step: PlanStep }) => {
  const config = stepConfigMap[step.type] || stepConfigMap['AÇÃO']; // Fallback to action if type is unexpected
  const Icon = config.icon;

  return (
    <Card className={`shadow-md border-l-4 ${config.borderClass}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon className={`h-5 w-5 mr-3 ${config.iconColor}`} />
            <CardTitle className="text-lg text-foreground">{step.toolName}</CardTitle>
          </div>
          {config.badgeVariant && <Badge variant={config.badgeVariant} className="ml-2">{step.type}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-3 pt-0">
        {step.chosenSubOptions && step.chosenSubOptions.length > 0 && (
          <div>
            <h4 className="font-semibold text-muted-foreground mb-1">Opções Selecionadas:</h4>
            <div className="flex flex-wrap gap-1">
              {step.chosenSubOptions.map((opt, i) => (
                <Badge key={i} variant="outline" className="font-normal bg-muted/50">{opt}</Badge>
              ))}
            </div>
          </div>
        )}
        <div>
          <h4 className="font-semibold text-muted-foreground mb-2 mt-3">Passo a Passo da Configuração:</h4>
          <div className="prose prose-sm prose-invert max-w-none text-foreground/90 
                        prose-headings:text-foreground prose-strong:text-foreground 
                        prose-ul:list-disc prose-li:marker:text-accent
                        prose-a:text-accent hover:prose-a:text-accent/80">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {step.detailedSteps}
            </ReactMarkdown>
          </div>
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
