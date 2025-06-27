
// src/components/KnowledgeBasePanel.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ToolColumn } from './ToolColumn';
import { VariableColumn } from './VariableColumn';
import { X, Zap, Target, ShieldCheck, Database, Copy, ClipboardPaste } from 'lucide-react';
import { useToolsStore } from '@/stores/useToolsStore';
import type { ToolCategory, Tool, SubOption, Variable } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToolCard } from '@/components';
import { IconButton } from './IconButton';
import { useToast } from '@/hooks/use-toast';
import { importKnowledgeBaseFromText } from '@/lib/kbManager';
// Removed ShadCN Button import as we are using raw buttons for import/export

const categoryColors: Record<ToolCategory, string> = {
  triggers: 'hsl(var(--destructive))',
  actions: 'hsl(var(--primary))',    
  constraints: 'hsl(145 70% 40%)', 
  variables: 'hsl(45 90% 50%)' 
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
  onOpenConfirmVariableDelete: (variableId: string, variableName?: string) => void;
  onCopy: () => void;
  onPaste: () => void;
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
  onOpenConfirmVariableDelete,
  onCopy,
  onPaste
}: KnowledgeBasePanelProps) {
  const triggers = useToolsStore(state => state.triggers);
  const actions = useToolsStore(state => state.actions);
  const constraints = useToolsStore(state => state.constraints);
  const variables = useToolsStore(state => state.variables);
  const overwriteState = useToolsStore(state => state.overwriteState);

  const { toast } = useToast();

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const importedData = importKnowledgeBaseFromText(text);
          overwriteState(importedData);
          toast({
            title: "Importação Concluída",
            description: "O banco de conhecimento foi atualizado com sucesso.",
          });
        } catch (error: any) {
          toast({
            title: "Erro na Importação",
            description: `Não foi possível importar o arquivo: ${error.message || "Formato inválido."}`,
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };
  
  const triggersData = {
    title: 'Gatilhos',
    category: 'triggers',
    icon: Zap,
    color: categoryColors.triggers,
    data: triggers,
  };
  const actionsData = {
    title: 'Ações',
    category: 'actions',
    icon: Target,
    color: categoryColors.actions,
    data: actions,
  };
  const constraintsData = {
    title: 'Restrições',
    category: 'constraints',
    icon: ShieldCheck,
    color: categoryColors.constraints,
    data: constraints,
  };
    const variablesData = {
    title: 'Variáveis',
    category: 'variables',
    icon: Database,
    color: categoryColors.variables,
    data: variables,
  };


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
              <IconButton
                onClick={onClose}
                ariaLabel="Fechar painel de conhecimento"
                className="text-muted-foreground hover:text-primary p-1 rounded-md"
              >
                <X size={24} />
              </IconButton>
            </div>

            <div className="px-6 pt-4 pb-2 text-sm flex-shrink-0">
                <p className="text-muted-foreground mb-4">
                A IA usará todas as ferramentas, variáveis e sub-opções listadas aqui para criar seus planos de automação.
                </p>
                <div className="flex space-x-3 mb-6 -mt-2">
                  <button 
                    onClick={onCopy} 
                    className="flex-1 flex items-center justify-center space-x-2 bg-muted text-muted-foreground px-3 py-2 rounded-lg text-sm hover:text-primary hover:bg-accent/20 transition-all"
                  >
                    <Copy size={16} />
                    <span>Copiar</span>
                  </button>
                  <button 
                    onClick={onPaste} 
                    className="flex-1 flex items-center justify-center space-x-2 bg-muted text-muted-foreground px-3 py-2 rounded-lg text-sm hover:text-primary hover:bg-accent/20 transition-all"
                  >
                    <ClipboardPaste size={16} />
                    <span>Colar configurações</span>
                  </button>
                </div>
            </div>


            <ScrollArea className="flex-grow">
              <div className="p-6 pt-0"> {/* Adjusted padding to pt-0 */}
                <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
                  
                  {triggersData && (
                    <div className="flex flex-col space-y-6 lg:w-1/4">
                       <ToolColumn
                        key={triggersData.category}
                        title={triggersData.title}
                        icon={triggersData.icon}
                        onAdd={() => onOpenAddTool(triggersData.category as ToolCategory)}
                        accentColor={triggersData.color}
                      >
                        {(triggersData.data as Tool[]).length === 0 && (
                          <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-sm text-muted-foreground text-center py-4"
                          >
                            Sem {triggersData.title.toLowerCase()} definidos.
                          </motion.p>
                        )}
                        <AnimatePresence>
                          {(triggersData.data as Tool[]).map(tool => (
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
                                onDelete={() => onOpenConfirmToolDelete(triggersData.category as ToolCategory, tool)}
                                onEdit={() => onOpenEditTool(triggersData.category as ToolCategory, tool)}
                                onAddSubOption={() => onOpenAddSubOption(triggersData.category as ToolCategory, tool)}
                                accentColor={triggersData.color}
                                onEditSubOption={(subOption) => onOpenEditSubOption(triggersData.category as ToolCategory, tool, subOption)}
                                onDeleteSubOption={(subOptionId) => onOpenConfirmSubOptionDelete(triggersData.category as ToolCategory, tool.id, subOptionId, tool.subOptions.find(so => so.id === subOptionId)?.name || 'esta sub-opção')}
                                onManageSubOption={(subOption) => onOpenManageTelas(triggersData.category as ToolCategory, tool, subOption)}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </ToolColumn>
                    </div>
                  )}

                  {actionsData && (
                    <div className="flex flex-col space-y-6 lg:w-1/4">
                      <ToolColumn
                        key={actionsData.category}
                        title={actionsData.title}
                        icon={actionsData.icon}
                        onAdd={() => onOpenAddTool(actionsData.category as ToolCategory)}
                        accentColor={actionsData.color}
                      >
                        {(actionsData.data as Tool[]).length === 0 && (
                           <motion.p 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-sm text-muted-foreground text-center py-4"
                          >
                            Sem {actionsData.title.toLowerCase()} definidos.
                          </motion.p>
                        )}
                        <AnimatePresence>
                          {(actionsData.data as Tool[]).map(tool => (
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
                                onDelete={() => onOpenConfirmToolDelete(actionsData.category as ToolCategory, tool)}
                                onEdit={() => onOpenEditTool(actionsData.category as ToolCategory, tool)}
                                onAddSubOption={() => onOpenAddSubOption(actionsData.category as ToolCategory, tool)}
                                accentColor={actionsData.color}
                                onEditSubOption={(subOption) => onOpenEditSubOption(actionsData.category as ToolCategory, tool, subOption)}
                                onDeleteSubOption={(subOptionId) => onOpenConfirmSubOptionDelete(actionsData.category as ToolCategory, tool.id, subOptionId, tool.subOptions.find(so => so.id === subOptionId)?.name || 'esta sub-opção')}
                                onManageSubOption={(subOption) => onOpenManageTelas(actionsData.category as ToolCategory, tool, subOption)}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </ToolColumn>
                    </div>
                  )}

                  {constraintsData && (
                     <div className="flex flex-col space-y-6 lg:w-1/4">
                      <ToolColumn
                        key={constraintsData.category}
                        title={constraintsData.title}
                        icon={constraintsData.icon}
                        onAdd={() => onOpenAddTool(constraintsData.category as ToolCategory)}
                        accentColor={constraintsData.color}
                      >
                        {(constraintsData.data as Tool[]).length === 0 && (
                           <motion.p 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-sm text-muted-foreground text-center py-4"
                          >
                            Sem {constraintsData.title.toLowerCase()} definidos.
                          </motion.p>
                        )}
                        <AnimatePresence>
                          {(constraintsData.data as Tool[]).map(tool => (
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
                                onDelete={() => onOpenConfirmToolDelete(constraintsData.category as ToolCategory, tool)}
                                onEdit={() => onOpenEditTool(constraintsData.category as ToolCategory, tool)}
                                onAddSubOption={() => onOpenAddSubOption(constraintsData.category as ToolCategory, tool)}
                                accentColor={constraintsData.color}
                                onEditSubOption={(subOption) => onOpenEditSubOption(constraintsData.category as ToolCategory, tool, subOption)}
                                onDeleteSubOption={(subOptionId) => onOpenConfirmSubOptionDelete(constraintsData.category as ToolCategory, tool.id, subOptionId, tool.subOptions.find(so => so.id === subOptionId)?.name || 'esta sub-opção')}
                                onManageSubOption={(subOption) => onOpenManageTelas(constraintsData.category as ToolCategory, tool, subOption)}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </ToolColumn>
                    </div>
                  )}
                  
                  {variablesData && (
                    <div className="flex flex-col space-y-6 lg:w-1/4">
                      <VariableColumn
                        key={variablesData.category}
                        title={variablesData.title}
                        icon={variablesData.icon}
                        accentColor={variablesData.color}
                        variables={variablesData.data as Variable[]}
                        onAdd={onOpenAddVariable}
                        onEdit={onOpenEditVariable}
                        onDelete={(variableId, variableName) => onOpenConfirmVariableDelete(variableId, variableName)}
                      />
                    </div>
                  )}

                </div>
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
