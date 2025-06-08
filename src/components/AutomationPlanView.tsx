// src/components/AutomationPlanView.tsx
import { GeneratedPlan, PlanStep } from "@/lib/types";
import { motion } from 'framer-motion';
import { Zap, Target, ShieldCheck } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const stepConfig: Record<string, { color: string; bgColor: string; icon: React.ElementType }> = {
  GATILHO: { color: 'text-red-400', bgColor: 'bg-red-900', icon: Zap },
  AÇÃO: { color: 'text-cyan-400', bgColor: 'bg-cyan-900', icon: Target },
  RESTRIÇÃO: { color: 'text-green-400', bgColor: 'bg-green-900', icon: ShieldCheck },
};

const StepCard = ({ step }: { step: PlanStep }) => {
  const config = stepConfig[step.type] || { color: 'text-gray-400', bgColor: 'bg-gray-700', icon: 'div' as React.ElementType };
  const Icon = config.icon;

  return (
    <div className={`rounded-lg shadow-lg border border-border overflow-hidden`}>
      {/* Header do Card */}
      <div className={`p-4 flex justify-between items-center ${config.bgColor} bg-opacity-30 border-b border-border`}>
        <div className="flex items-center">
          <Icon className={`h-6 w-6 mr-3 ${config.color}`} />
          <h3 className="font-headline text-lg text-foreground">{step.toolName}</h3>
        </div>
        <div className={`text-xs font-bold py-1 px-3 rounded-full ${config.bgColor} ${config.color}`}>
          {step.type}
        </div>
      </div>

      {/* Corpo do Card */}
      <div className="p-4 bg-card space-y-4">
        {step.chosenSubOptions && step.chosenSubOptions.length > 0 && (
          <div>
            <h4 className="font-semibold text-muted-foreground mb-2">Opções Selecionadas:</h4>
            <div className="flex flex-wrap gap-2">
              {step.chosenSubOptions.map((opt, i) => (
                <span key={i} className="text-xs bg-muted text-muted-foreground py-1 px-2 rounded-md">{opt}</span>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h4 className="font-semibold text-muted-foreground mb-2">Passo a Passo da Configuração:</h4>
          <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                     // For fenced code blocks, use the pre component styling by wrapping in pre
                    <pre className="bg-muted/50 rounded p-3 overflow-x-auto my-2">
                      <code className={`language-${match[1]}`} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    // For inline code
                    <code className="bg-muted/80 text-accent rounded px-1 py-0.5 text-xs break-words font-mono" {...props}>
                      {children}
                    </code>
                  )
                },
                pre({node, children, ...props}) {
                  // This 'pre' handles markdown like triple-backtick blocks
                  // We find the 'code' child to extract its children for direct rendering inside our styled pre
                  const codeChild = React.Children.toArray(children).find(
                    (child) => React.isValidElement(child) && child.type === 'code'
                  ) as React.ReactElement | undefined;

                  return (
                    <pre className="bg-muted/50 rounded p-3 overflow-x-auto my-2" {...props}>
                      {codeChild ? codeChild.props.children : children}
                    </pre>
                  );
                }
              }}
            >
              {step.detailedSteps}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export function AutomationPlanView({ plan }: { plan: GeneratedPlan }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 space-y-4"
    >
      <h2 className="font-headline text-3xl text-primary font-bold bg-gradient-to-r from-accent to-accent-end bg-clip-text text-transparent pb-2">
        {plan.macroName}
      </h2>
      <div className="space-y-6">
        {plan.steps.map((step, index) => <StepCard key={index} step={step} />)}
      </div>
    </motion.div>
  );
}
