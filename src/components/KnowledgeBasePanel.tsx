// src/components/KnowledgeBasePanel.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ToolColumn } from './ToolColumn';
import { ToolCard } from './ToolCard';
import { X, Zap, Target, ShieldCheck } from 'lucide-react';
import { useToolsStore } from '@/stores/useToolsStore';
import type { ToolCategory, Tool } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area'; // For better scrolling within panel

interface KnowledgeBasePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddTool: (category: ToolCategory) => void;
  onOpenConfirmDelete: (category: ToolCategory, tool: Tool) => void; // Pass full tool for name in confirm modal
  onOpenAddSubOption: (category: ToolCategory, tool: Tool) => void;
}

export function KnowledgeBasePanel({ 
  isOpen, 
  onClose, 
  onOpenAddTool, 
  onOpenConfirmDelete, 
  onOpenAddSubOption 
}: KnowledgeBasePanelProps) {
  // Get reactive state from the store
  const triggers = useToolsStore(state => state.triggers);
  const actions = useToolsStore(state => state.actions);
  const constraints = useToolsStore(state => state.constraints);

  const allColumns = [
    { title: "Gatilhos", icon: Zap, category: "triggers" as ToolCategory, data: triggers },
    { title: "Ações", icon: Target, category: "actions" as ToolCategory, data: actions },
    { title: "Restrições", icon: ShieldCheck, category: "constraints" as ToolCategory, data: constraints },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-40" // Increased opacity for better focus
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full md:max-w-3xl lg:max-w-4xl bg-card shadow-2xl z-50 flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-border flex-shrink-0">
              <h2 className="font-headline text-2xl text-primary">Banco de Conhecimento da IA</h2>
              <button 
                onClick={onClose} 
                className="text-muted-foreground hover:text-primary p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Fechar painel de conhecimento"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-muted-foreground px-6 pt-4 pb-2 text-sm flex-shrink-0">
              A IA usará todas as ferramentas e sub-opções listadas aqui para criar seus planos de automação.
            </p>
            <ScrollArea className="flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                {allColumns.map(({ title, icon, category, data }) => (
                  <ToolColumn key={category} title={title} icon={icon} onAdd={() => onOpenAddTool(category)}>
                    {data.length === 0 && (
                       <motion.p 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-sm text-muted-foreground text-center py-4"
                      >
                        Sem {title.toLowerCase()} definidos.
                      </motion.p>
                    )}
                    <AnimatePresence>
                      {data.map(tool => (
                        <motion.div 
                          key={tool.id} 
                          layout 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
                          transition={{ duration: 0.2 }}
                        >
                          <ToolCard
                            name={tool.name}
                            subOptions={tool.subOptions}
                            onDelete={() => onOpenConfirmDelete(category, tool)}
                            onAddSubOption={() => onOpenAddSubOption(category, tool)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </ToolColumn>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
