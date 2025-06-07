// src/components/AIPromptArea.tsx
'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useToolsStore } from '@/stores/useToolsStore';
import type { GeneratedPlan } from '@/lib/types';
import { MacroView } from './MacroView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
        // Se a API retornar um erro JSON estruturado, use a mensagem dele.
        const errorMessage = data.error || data.message || `Erro ${apiResponse.status}: ${apiResponse.statusText}.`;
        throw new Error(errorMessage);
      }
      
      // Validação básica da estrutura do plano
      if (!data.macroName || !data.explanation || !Array.isArray(data.triggers) || !Array.isArray(data.actions) || !Array.isArray(data.constraints)) {
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
            className="flex-grow pr-28"
            disabled={isLoading}
            aria-label="Prompt de Automação"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 font-bold",
              "bg-gradient-to-r from-accent to-accent-end text-accent-foreground hover:opacity-90 transition-opacity",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Gerar
          </Button>
        </div>
      </form>

      {isLoading && <p className="text-center text-muted-foreground animate-pulse py-4">Gerando plano...</p>}
      {error && <p className="text-center text-destructive py-4">{error}</p>}
      {plan && <MacroView plan={plan} />}
    </div>
  );
}
