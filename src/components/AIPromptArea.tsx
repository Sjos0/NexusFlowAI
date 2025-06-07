// src/components/AIPromptArea.tsx
'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useToolsStore } from '@/stores/useToolsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function AIPromptArea() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const allTools = useToolsStore((state) => ({
    triggers: state.triggers,
    actions: state.actions,
    constraints: state.constraints,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResponse('');

    try {
      const apiResponse = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, tools: allTools }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({ message: 'Falha ao gerar o plano. Resposta não JSON.' }));
        throw new Error(errorData.message || 'Falha ao gerar o plano.');
      }

      const data = await apiResponse.json();
      setResponse(data.plan);
    } catch (error) {
      console.error(error);
      setResponse(error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow-md">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Descreva a automação que você deseja criar..."
            className="flex-grow pr-28" // Adjusted paddingRight to make space for the button
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

      {(isLoading || response) && (
        <div className="mt-4 p-4 bg-muted rounded-md prose prose-sm prose-invert max-w-none">
          {isLoading ? (
            <p className="text-muted-foreground animate-pulse">Gerando plano...</p>
          ) : (
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={{ __html: response }} />
          )}
        </div>
      )}
    </div>
  );
}
