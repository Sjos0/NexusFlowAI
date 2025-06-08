// src/components/AIPromptArea.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { CornerDownLeft } from 'lucide-react'; 
import { useToolsStore } from '@/stores/useToolsStore';
import type { GeneratedPlan, ChatMessage, Tool, ToolCategory } from '@/lib/types';
import { AutomationPlanView } from './AutomationPlanView';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHasMounted } from '@/hooks/useHasMounted';


export function AIPromptArea() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasMounted = useHasMounted();

  const currentTools = useToolsStore(state => ({
    triggers: state.triggers,
    actions: state.actions,
    constraints: state.constraints,
    variables: state.variables,
  }));
  

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (hasMounted) {
        inputRef.current?.focus();
    }
  }, [hasMounted]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isGeneratingPlan) return;

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsGeneratingPlan(true);

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages, 
          tools: currentTools 
        }),
      });
      
      let responseData;
      try {
        // Attempt to parse JSON, this might throw if body is not valid JSON (e.g. HTML error page)
        responseData = await res.json();
      } catch (jsonParseError) {
        // If parsing failed and res.ok is false, it's likely a server error page (HTML/text)
        if (!res.ok) {
          throw new Error(`API Error: ${res.status} ${res.statusText}. Failed to parse error response body.`);
        }
        // If res.ok is true but parsing failed, this is an unexpected successful response format
        throw new Error(`API Error: Received OK status (${res.status}) but failed to parse response body. This is unexpected.`);
      }

      if (!res.ok) {
        // If res.ok is false, responseData should (ideally) contain an error message from the API
        const errorMessage = responseData?.error || `API Error: ${res.status} ${res.statusText}. No specific error message provided by the API.`;
        throw new Error(errorMessage);
      }

      // If res.ok is true, responseData is the successfully generated plan
      const newAiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        content: responseData as GeneratedPlan,
      };
      setMessages(prev => [...prev, newAiMessage]);

    } catch (err) {
      console.error("Chat submission error:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido ao contatar Nexus.";
      const errorAiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        content: { 
          macroName: "Erro de Comunicação", 
          steps: [{ 
            type: "AÇÃO", 
            toolName: "Diagnóstico de Erro", 
            chosenSubOptions: [], 
            detailedSteps: `**Falha ao processar seu pedido:**\n\n- ${errorMessage}` 
          }] 
        },
      };
      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsGeneratingPlan(false);
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
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
      {/* Chat History */}
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 space-y-4 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div 
              key={msg.id} 
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: messages.length > 1 && index === messages.length -1 ? 0.1 : 0
              }}
              className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div className={cn(
                "max-w-[85%] sm:max-w-[75%] p-0", 
                 msg.role === 'user' ? "self-end" : "self-start"
              )}>
                {msg.role === 'user' ? (
                  <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-md">
                    <p className="whitespace-pre-wrap">{msg.content as string}</p>
                  </div>
                ) : (
                  <AutomationPlanView plan={msg.content as GeneratedPlan} />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isGeneratingPlan && messages.length > 0 && messages[messages.length-1].role === 'user' && (
            <motion.div 
                key="loading-indicator"
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
      </div>

      {/* Input Area */}
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
              placeholder="Converse com o Nexus ou descreva sua automação..."
              className="w-full bg-transparent text-foreground resize-none p-3 pr-12 focus:outline-none placeholder:text-muted-foreground text-sm"
              disabled={isGeneratingPlan}
              aria-label="Mensagem para Nexus"
            />
            <button
              type="submit"
              disabled={isGeneratingPlan || !input.trim()}
              className={cn(
                "flex items-center justify-center h-10 w-10 rounded-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-2 flex-shrink-0",
                "bg-gradient-to-r from-accent to-accent-end text-accent-foreground"
              )}
              aria-label="Enviar"
            >
              {isGeneratingPlan ? (
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
