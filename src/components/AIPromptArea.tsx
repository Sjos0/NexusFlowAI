// src/components/AIPromptArea.tsx
'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useToolsStore } from '@/stores/useToolsStore';
import type { GeneratedPlan } from '@/lib/types';
import { AutomationPlanView } from './AutomationPlanView'; // Use the new component
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";


export function AIPromptArea() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const allTools = useToolsStore((state) => ({
    triggers: state.triggers,
    actions: state.actions,
    constraints: state.constraints,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setPlan(null);

    try {
      const apiResponse = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tools: allTools }),
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        // If data.error exists, prioritize that, otherwise use a generic message.
        const errorMessage = data.error || data.message || `Erro ${apiResponse.status}: ${apiResponse.statusText}.`;
        throw new Error(errorMessage);
      }
      
      // Additional validation for the expected structure
      if (!data.macroName || !Array.isArray(data.steps)) {
        throw new Error('A IA retornou um plano com formato inesperado.');
      }

      setPlan(data as GeneratedPlan);
    } catch (err) {
      console.error("Erro ao gerar plano:", err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao tentar gerar o plano.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow-md">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="relative flex items-center">
          <Input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Descreva a automação que você deseja criar..."
            className="flex-grow pr-32 sm:pr-36 text-base" // Increased padding for larger button
            disabled={isLoading}
            aria-label="Prompt de Automação"
          />
          <Button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 font-bold px-3 sm:px-4 py-1.5 h-auto text-sm", // Adjusted padding and height
              "bg-gradient-to-r from-accent to-accent-end text-accent-foreground hover:opacity-90 transition-opacity",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Sparkles className="h-4 w-4 mr-1.5 sm:mr-2" />
            Gerar Plano
          </Button>
        </div>
      </form>

      {isLoading && (
        <div className="text-center text-muted-foreground animate-pulse py-4 flex items-center justify-center">
          <Sparkles className="h-5 w-5 mr-2 animate-spin" />
          Gerando plano detalhado...
        </div>
      )}
      {error && (
        <Alert variant="destructive" className="my-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Erro ao Gerar Plano</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      {plan && <AutomationPlanView plan={plan} />}
    </div>
  );
}
