// src/components/KnowledgeBasePanel.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ToolColumn } from './ToolColumn';
import { VariableColumn } from './VariableColumn';
import { X, Zap, Target, ShieldCheck, Database } from 'lucide-react';
import { useToolsStore } from '@/stores/useToolsStore';
import type { ToolCategory, Tool, SubOption, Variable } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const categoryColors: Record<ToolCategory, string> = {
  triggers: 'hsl(var(--destructive))',
  actions: 'hsl(var(--primary))',
  constraints: 'hsl(145 70% 40%)', 
  variables: 'hsl(45 90% 50%)' // A distinct yellow, e.g., yellow-500
};

interface KnowledgeBasePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddTool: (category: ToolCategory) => void;
  onOpenConfirmToolDelete: (category: ToolCategory, tool: Tool) => void;
  onOpenAddSubOption: (category: ToolCategory, tool: Tool) => void;
  onOpenManageTelas: (category: ToolCategory, tool: Tool, subOption: SubOption) => void;
  onOpenEditTool: (category: ToolCategory, tool: Tool) => void;
  onOpenEditSubOption: (category: ToolCategory, tool: Tool, subOption: SubOption) => void;
  onOpenConfirmSubOptionDelete: (category: ToolCategory, toolId: string, subOptionId: string, subOptionName: string) => void;
  onOpenAddVariable: () => void;
  onOpenEditVariable: (variable: Variable) => void;
  onOpenConfirmVariableDelete: (variableId: string, variableName: string) => void;
}

export function KnowledgeBasePanel({ 
  isOpen, 
  onClose, 
  onOpenAddTool, 
  onOpenConfirmToolDelete, 
  onOpenAddSubOption,
  onOpenManageTelas,
  onOpenEditTool,
  onOpenEditSubOption,
  onOpenConfirmSubOptionDelete,
  onOpenAddVariable,
  onOpenEditVariable,
  onOpenConfirmVariableDelete
}: KnowledgeBasePanelProps) {
  const triggers = useToolsStore(state => state.triggers);
  const actions = useToolsStore(state => state.actions);
  const constraints = useToolsStore(state => state.constraints);
  const variables = useToolsStore(state => state.variables);

  const allColumnsData = [
    { title: "Gatilhos", icon: Zap, category: "triggers" as ToolCategory, data: triggers, color: categoryColors.triggers },
    { title: "Ações", icon: Target, category: "actions" as ToolCategory, data: actions, color: categoryColors.actions },
    { title: "Restrições", icon: ShieldCheck, category: "constraints" as ToolCategory, data: constraints, color: categoryColors.constraints },
    { title: "Variáveis", icon: Database, category: "variables" as ToolCategory, data: variables, color: categoryColors.variables },
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
            className="fixed inset-0 bg-black/80 z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full md:max-w-3xl lg:max-w-4xl xl:max-w-5xl bg-card shadow-2xl z-50 flex flex-col"
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
              A IA usará todas as ferramentas, variáveis e sub-opções listadas aqui para criar seus planos de automação.
            </p>
            <ScrollArea className="flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                {allColumnsData.map(({ title, icon: IconElement, category, data, color }) => (
                  category === 'variables' ? (
                    <VariableColumn
                      key={category}
                      title={title}
                      icon={IconElement}
                      accentColor={color}
                      variables={data as Variable[]}
                      onAdd={onOpenAddVariable}
                      onEdit={onOpenEditVariable}
                      onDelete={onOpenConfirmVariableDelete}
                    />
                  ) : (
                    <ToolColumn 
                      key={category} 
                      title={title} 
                      icon={IconElement} 
                      onAdd={() => onOpenAddTool(category)} 
                      accentColor={color}
                    >
                      {(data as Tool[]).length === 0 && (
                         <motion.p 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-sm text-muted-foreground text-center py-4"
                        >
                          Sem {title.toLowerCase()} definidos.
                        </motion.p>
                      )}
                      <AnimatePresence>
                        {(data as Tool[]).map(tool => (
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
                              onDelete={() => onOpenConfirmToolDelete(category, tool)}
                              onEdit={() => onOpenEditTool(category, tool)}
                              onAddSubOption={() => onOpenAddSubOption(category, tool)}
                              accentColor={color}
                              onEditSubOption={(subOption) => onOpenEditSubOption(category, tool, subOption)}
                              onDeleteSubOption={(subOptionId) => onOpenConfirmSubOptionDelete(category, tool.id, subOptionId, tool.subOptions.find(so => so.id === subOptionId)?.name || 'esta sub-opção')}
                              onManageSubOption={(subOption) => onOpenManageTelas(category, tool, subOption)}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </ToolColumn>
                  )
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
