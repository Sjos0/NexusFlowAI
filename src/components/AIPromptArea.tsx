// src/components/AIPromptArea.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Sparkles, CornerDownLeft, Terminal } from 'lucide-react';
import { useToolsStore } from '@/stores/useToolsStore';
import type { GeneratedPlan } from '@/lib/types';
import { AutomationPlanView } from './AutomationPlanView';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    // setPlan(null); // Keep previous plan visible until new one is ready or error occurs

    try {
      const apiResponse = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tools: allTools }),
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok || data.error) {
        const errorMessage = data.error || `Error ${apiResponse.status}: ${apiResponse.statusText}. Failed to fetch plan.`;
        throw new Error(errorMessage);
      }
      
      if (!data.macroName || !Array.isArray(data.steps)) {
        throw new Error('AI returned an unexpected plan format.');
      }

      setPlan(data as GeneratedPlan);
      setPrompt(''); // Clear prompt on successful submission
    } catch (err) {
      console.error("Error generating plan:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while trying to generate the plan.');
      setPlan(null); // Clear plan on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col flex-grow">
      {/* This area will display the result */}
      <div className="flex-grow mb-4 min-h-[200px] overflow-y-auto"> {/* Added min-h and overflow */}
        {isLoading && !plan && ( // Only show main loading if no plan is visible
           <div className="text-center text-muted-foreground animate-pulse py-10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 mr-3 animate-spin" />
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

      {/* The New, Prominent Input Area */}
      <div className="bg-card rounded-lg p-2 shadow-2xl sticky bottom-6 border border-border">
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-end">
            <TextareaAutosize
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              minRows={1}
              maxRows={8}
              placeholder="Descreva a automação que você deseja ou faça uma pergunta sobre um plano existente..."
              className="w-full bg-transparent text-foreground resize-none p-3 pr-16 focus:outline-none placeholder:text-muted-foreground text-sm"
              disabled={isLoading}
              aria-label="Prompt de automação"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className={cn(
                "absolute right-3 bottom-2.5 flex items-center justify-center h-10 w-10 rounded-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                "bg-gradient-to-r from-accent to-accent-end text-accent-foreground"
              )}
              aria-label="Enviar"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CornerDownLeft size={20} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
