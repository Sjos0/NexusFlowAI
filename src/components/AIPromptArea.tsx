// src/components/AIPromptArea.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { CornerDownLeft, Terminal } from 'lucide-react'; // Added Terminal for error icon
import { useToolsStore } from '@/stores/useToolsStore';
import type { GeneratedPlan, ChatMessage } from '@/lib/types';
import { AutomationPlanView } from './AutomationPlanView';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For better error display

export function AIPromptArea() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Get all tools using getState for sending with API request
  // This is okay if tools don't change during a single chat session or if a refresh is acceptable
  const allTools = useToolsStore.getState(); 
  const inputRef = useRef<HTMLTextAreaElement>(null); // For focusing input

  useEffect(() => {
    // Scroll to bottom of chat
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // Focus input on initial load
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput(''); // Clear input after sending
    setIsLoading(true);

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages, // Send the whole history including the new user message
          tools: { // Ensure tools are in the expected structure
            triggers: allTools.triggers,
            actions: allTools.actions,
            constraints: allTools.constraints,
          } 
        }),
      });
      
      const responseData = await res.json();

      if (!res.ok) {
        // Use the error message from the API if available
        throw new Error(responseData.error || `API Error: ${res.status} ${res.statusText}`);
      }

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
        // Present the error as a GeneratedPlan so AutomationPlanView can try to render it
        // or as a simple text message within the AutomationPlanView if it's just a string
        content: { 
          macroName: "Erro de Comunicação", 
          steps: [{ 
            type: "AÇÃO", // Or some other generic type
            toolName: "Diagnóstico de Erro", 
            chosenSubOptions: [], 
            detailedSteps: `**Falha ao processar seu pedido:**\n\n- ${errorMessage}` 
          }] 
        },
      };
      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus(); // Re-focus input
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
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 space-y-4 pb-4"> {/* Added pb-4 */}
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
                delay: messages.length > 1 && index === messages.length -1 ? 0.1 : 0 // Only delay if not the very first message
              }}
              className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div className={cn(
                "max-w-[85%] sm:max-w-[75%] p-0", // p-0 on wrapper
                 msg.role === 'user' ? "self-end" : "self-start"
              )}>
                {msg.role === 'user' ? (
                  <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-md">
                    <p className="whitespace-pre-wrap">{msg.content as string}</p>
                  </div>
                ) : (
                  // AutomationPlanView expects a 'plan' prop which is GeneratedPlan
                  // It will now handle rendering the AI's plan or the structured error message
                  <AutomationPlanView plan={msg.content as GeneratedPlan} />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
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
          <div className="bg-card rounded-lg p-2 shadow-xl flex items-end border border-border">
            <TextareaAutosize
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              minRows={1}
              maxRows={6}
              placeholder="Converse com o Nexus ou descreva sua automação..."
              className="w-full bg-transparent text-foreground resize-none p-3 pr-12 focus:outline-none placeholder:text-muted-foreground text-sm"
              disabled={isLoading}
              aria-label="Mensagem para Nexus"
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
