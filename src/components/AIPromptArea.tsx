// src/components/AIPromptArea.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { CornerDownLeft } from 'lucide-react'; 
import { useToolsStore } from '@/stores/useToolsStore';
import type { GeneratedPlan } from '@/lib/types';
import { AutomationPlanView } from './AutomationPlanView';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHasMounted } from '@/hooks/useHasMounted';

export function AIPromptArea() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  
  const allTools = useToolsStore(state => ({
    triggers: state.triggers,
    actions: state.actions,
    constraints: state.constraints,
    variables: state.variables,
  }));
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasMounted = useHasMounted();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [plan, error, isLoading]); // Scroll on new plan, error, or loading state change

  useEffect(() => {
    if (hasMounted) {
        inputRef.current?.focus();
    }
  }, [hasMounted]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setPlan(null); 

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, tools: allTools }),
      });
      
      let responseData;
      try {
        responseData = await res.json();
      } catch (jsonParseError) {
        if (!res.ok) {
          // If parsing failed and res.ok is false, it's likely a server error page (HTML/text)
          // Try to get text from response if possible, otherwise use statusText.
          let errorDetail = res.statusText;
          try {
            errorDetail = await res.text();
          } catch (textError) {
            // Ignore, stick with statusText
          }
          throw new Error(`API Error: ${res.status} ${errorDetail}. Failed to parse error response body.`);
        }
        // If res.ok is true but parsing failed, this is an unexpected successful response format
        throw new Error(`API Error: Received OK status (${res.status}) but failed to parse response body. This is unexpected.`);
      }
      
      if (!res.ok) {
        throw new Error(responseData.error || `API Error: ${res.status} ${res.statusText}. No specific error message provided by the API.`);
      }

      setPlan(responseData as GeneratedPlan);
      // setInput(''); // Optional: Clear input on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Um erro desconhecido ocorreu.";
      console.error("Submit error in AIPromptArea:", err);
      setError(errorMessage);
      setPlan({ // Provide a structured error plan for AutomationPlanView
        macroName: "Erro ao Gerar Plano",
        steps: [{
          type: "AÇÃO",
          toolName: "Diagnóstico de Erro",
          chosenSubOptions: [],
          detailedSteps: `**Falha ao processar seu pedido:**\n\n- ${errorMessage}`
        }]
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full p-4 lg:p-6">
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 space-y-4 pb-4">
        <AnimatePresence initial={false}>
          {isLoading && (
            <motion.div 
                key="loading-indicator-chat"
                layout
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
            >
                <div className="bg-card text-card-foreground p-3 rounded-xl shadow-md inline-flex items-center space-x-2">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-300"></div>
                </div>
            </motion.div>
          )}
          {/* Display error directly using AutomationPlanView structure */}
          {error && !isLoading && plan && plan.macroName === "Erro ao Gerar Plano" && (
             <motion.div 
              key="error-message"
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex justify-start"
            >
                <AutomationPlanView plan={plan} />
            </motion.div>
          )}
          {plan && plan.macroName !== "Erro ao Gerar Plano" && !isLoading && (
            <motion.div
              key={plan.macroName + (plan.steps[0]?.toolName || 'empty')} // More unique key if plan can be empty
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex justify-start"
            >
              <AutomationPlanView plan={plan} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0 pt-4 border-t border-border">
        <form onSubmit={handleSubmit}>
          <div className="bg-card rounded-lg p-2 shadow-xl flex items-end border border-border mt-2"> 
            <TextareaAutosize
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              minRows={1}
              maxRows={6}
              placeholder="Descreva a automação que você deseja..."
              className="w-full bg-transparent text-foreground resize-none p-3 pr-12 focus:outline-none placeholder:text-muted-foreground text-sm"
              disabled={isLoading}
              aria-label="Prompt para Nexus"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={cn(
                "flex items-center justify-center h-10 w-10 rounded-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-2 flex-shrink-0",
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
