
// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
// Component Imports
import { 
  AddToolModal, 
  ConfirmationModal, 
  AddSubOptionModal, 
  KnowledgeBasePanel, 
  AIPromptArea, 
  ManageTelasModal,
  EditToolModal,
  EditSubOptionModal,
  AddEditVariableModal
} from '@/components';
// Util & Hook Imports
import { useToolsStore } from '@/stores/useToolsStore';
import type { ToolCategory, Tool, SubOption, Tela, Variable } from '@/lib/types';
import { BotMessageSquare } from 'lucide-react';

export default function Home() {
  const { 
    hydrate, 
    updateTool, 
    removeTool, 
    addTool,
    addVariable,
    removeVariable,
    updateVariable
  } = useToolsStore();

  useEffect(() => { 
    hydrate(); 
  }, [hydrate]);

  // State for Modals
  const [addToolModalState, setAddToolModalState] = useState<{ isOpen: boolean; category: ToolCategory | null; categoryTitle: string }>({ isOpen: false, category: null, categoryTitle: '' });
  const [confirmToolDeleteModalState, setConfirmToolDeleteModalState] = useState<{ isOpen: boolean; toolId: string | null; category: ToolCategory | null; toolName: string | null }>({ isOpen: false, toolId: null, category: null, toolName: null });
  const [addSubOptionModalState, setAddSubOptionModalState] = useState<{ isOpen: boolean; tool: (Tool & { category: ToolCategory }) | null }>({ isOpen: false, tool: null });
  
  const [manageTelasModalState, setManageTelasModalState] = useState<{
    isOpen: boolean;
    toolId: string | null;
    category: ToolCategory | null;
    subOption: SubOption | null;
  }>({ isOpen: false, toolId: null, category: null, subOption: null });

  const [editToolModalState, setEditToolModalState] = useState<{
    isOpen: boolean;
    tool: Tool & { category: ToolCategory } | null;
  }>({ isOpen: false, tool: null });

  const [editSubOptionModalState, setEditSubOptionModalState] = useState<{ 
    isOpen: boolean; 
    toolId: string; 
    category: ToolCategory; 
    subOption: SubOption 
  } | null>(null);

  const [confirmSubOptionDeleteModalState, setConfirmSubOptionDeleteModalState] = useState<{ 
    isOpen: boolean; 
    toolId: string; 
    category: ToolCategory; 
    subOptionId: string;
    subOptionName: string;
  } | null>(null);
  
  const [addEditVariableModalState, setAddEditVariableModalState] = useState<{ isOpen: boolean; variable?: Variable }>({ isOpen: false });
  const [confirmVariableDeleteModalState, setConfirmVariableDeleteModalState] = useState<{ isOpen: boolean; variableId: string | null; variableName?: string }>({ isOpen: false, variableId: null });

  const [isKbOpen, setIsKbOpen] = useState(false);

  const categoryTitles: Record<ToolCategory, string> = {
    triggers: 'Gatilhos',
    actions: 'Ações',
    constraints: 'Restrições',
    variables: 'Variáveis'
  };

  // === Handlers for Modals ===
  const handleOpenAddToolModal = (category: ToolCategory) => {
    setAddToolModalState({ isOpen: true, category, categoryTitle: categoryTitles[category] });
  };

  const handleAddToolSubmit = (name: string, subOptionNames: string[]) => {
    if (addToolModalState.category && addToolModalState.category !== 'variables') {
      const newSubOptions: SubOption[] = subOptionNames.map(soName => ({ id: crypto.randomUUID(), name: soName, telas: [] }));
      addTool(addToolModalState.category, { id: crypto.randomUUID(), name, subOptions: newSubOptions });
    }
    setAddToolModalState({ isOpen: false, category: null, categoryTitle: '' });
  };
  
  const handleOpenConfirmToolDelete = (category: ToolCategory, tool: Tool) => {
    setConfirmToolDeleteModalState({ isOpen: true, toolId: tool.id, category, toolName: tool.name });
  };
  
  const handleConfirmToolDelete = () => {
    if (confirmToolDeleteModalState.toolId && confirmToolDeleteModalState.category && confirmToolDeleteModalState.category !== 'variables') {
      removeTool(confirmToolDeleteModalState.category, confirmToolDeleteModalState.toolId);
    }
    setConfirmToolDeleteModalState({ isOpen: false, toolId: null, category: null, toolName: null });
  };

  const handleOpenAddSubOption = (category: ToolCategory, tool: Tool) => {
    setAddSubOptionModalState({ isOpen: true, tool: { ...tool, category } });
  };

  const handleAddSubOptionSubmit = (newSubOptionNames: string[]) => {
    const { tool } = addSubOptionModalState;
    if (tool && tool.category !== 'variables') {
      const newSubOptionsFromNames: SubOption[] = newSubOptionNames.map(name => ({ id: crypto.randomUUID(), name, telas: [] }));
      const existingSubOptionsObjects: SubOption[] = tool.subOptions.map(so => 
        typeof so === 'string' ? { id: crypto.randomUUID(), name: so, telas: [] } : so
      );
      const allSubOptions = [...existingSubOptionsObjects, ...newSubOptionsFromNames];
      updateTool(tool.category, tool.id, { subOptions: allSubOptions });
    }
    setAddSubOptionModalState({ isOpen: false, tool: null });
  };

  const handleOpenManageTelas = (toolId: string, category: ToolCategory, subOption: SubOption) => {
    setManageTelasModalState({ isOpen: true, toolId, category, subOption });
  };

  const handleSaveTelas = (updatedSubOption: SubOption) => {
    const { toolId, category } = manageTelasModalState;
    if (!toolId || !category || category === 'variables') return;

    const toolsForCategory = useToolsStore.getState()[category];
    const toolToUpdate = (toolsForCategory as Tool[]).find(t => t.id === toolId);

    if (!toolToUpdate) return;

    const newSubOptionsForTool = toolToUpdate.subOptions.map(so => 
      so.id === updatedSubOption.id ? updatedSubOption : so
    );

    updateTool(category, toolId, { subOptions: newSubOptionsForTool });
    setManageTelasModalState({ isOpen: false, toolId: null, category: null, subOption: null });
  };

  const handleOpenEditTool = (category: ToolCategory, tool: Tool) => {
    setEditToolModalState({ isOpen: true, tool: { ...tool, category } });
  };

  const handleEditToolSave = (newName: string) => {
    if (editToolModalState.tool && editToolModalState.tool.category !== 'variables') {
      const { id, category } = editToolModalState.tool;
      updateTool(category, id, { name: newName });
    }
    setEditToolModalState({ isOpen: false, tool: null });
  };

  const handleOpenEditSubOption = (category: ToolCategory, tool: Tool, subOption: SubOption) => {
    setEditSubOptionModalState({ isOpen: true, toolId: tool.id, category, subOption });
  };

  const handleEditSubOptionSave = (newName: string) => {
    if (!editSubOptionModalState || editSubOptionModalState.category === 'variables') return;
    const { toolId, category, subOption } = editSubOptionModalState;
    const toolToUpdate = (useToolsStore.getState()[category] as Tool[]).find(t => t.id === toolId);
    if (!toolToUpdate) return;
    const newSubOptions = toolToUpdate.subOptions.map(so => so.id === subOption.id ? { ...so, name: newName } : so);
    updateTool(category, toolId, { subOptions: newSubOptions });
    setEditSubOptionModalState(null);
  };

  const handleOpenConfirmSubOptionDelete = (category: ToolCategory, toolId: string, subOptionId: string, subOptionName: string) => {
    setConfirmSubOptionDeleteModalState({ isOpen: true, toolId, category, subOptionId, subOptionName });
  };

  const handleConfirmSubOptionDelete = () => {
    if (!confirmSubOptionDeleteModalState || confirmSubOptionDeleteModalState.category === 'variables') return;
    const { toolId, category, subOptionId } = confirmSubOptionDeleteModalState;
    const toolToUpdate = (useToolsStore.getState()[category] as Tool[]).find(t => t.id === toolId);
    if (!toolToUpdate) return;
    const newSubOptions = toolToUpdate.subOptions.filter(so => so.id !== subOptionId);
    updateTool(category, toolId, { subOptions: newSubOptions });
    setConfirmSubOptionDeleteModalState(null);
  };

  // Variable Handlers
  const handleOpenAddVariable = () => {
    setAddEditVariableModalState({ isOpen: true });
  };

  const handleOpenEditVariable = (variable: Variable) => {
    setAddEditVariableModalState({ isOpen: true, variable });
  };

  const handleSaveVariable = (variableData: Omit<Variable, 'id' | 'description'>) => {
    if (addEditVariableModalState.variable) { 
      updateVariable(addEditVariableModalState.variable.id, variableData);
    } else { 
      addVariable(variableData);
    }
    setAddEditVariableModalState({ isOpen: false });
  };

  const handleOpenConfirmVariableDelete = (variableId: string, variableName: string) => {
    setConfirmVariableDeleteModalState({ isOpen: true, variableId, variableName });
  };

  const handleConfirmVariableDelete = () => {
    if (confirmVariableDeleteModalState.variableId) {
      removeVariable(confirmVariableDeleteModalState.variableId);
    }
    setConfirmVariableDeleteModalState({ isOpen: false, variableId: null, variableName: undefined });
  };

  return (
    <>
      <main className="flex flex-col h-screen bg-background">
        
        <header className="flex justify-between items-center p-4 lg:p-6 border-b border-border flex-shrink-0">
          <div>
            <h1 className="font-headline text-2xl font-bold bg-gradient-to-r from-accent to-accent-end bg-clip-text text-transparent">
              NexusFlow
            </h1>
            <p className="text-muted-foreground text-sm">Seu co-piloto de automação para MacroDroid</p>
          </div>
          <button 
            onClick={() => setIsKbOpen(true)}
            className="flex items-center space-x-2 bg-card text-muted-foreground px-4 py-2 rounded-lg hover:text-primary transition-colors font-medium"
          >
            <BotMessageSquare size={18} />
            <span>Banco de Conhecimento</span>
          </button>
        </header>
        
        <div className="flex-grow flex justify-center items-center overflow-y-auto p-4 lg:p-6">
          <AIPromptArea />
        </div>

      </main>

      <KnowledgeBasePanel 
        isOpen={isKbOpen} 
        onClose={() => setIsKbOpen(false)}
        onOpenAddTool={handleOpenAddToolModal}
        onOpenConfirmToolDelete={handleOpenConfirmToolDelete}
        onOpenAddSubOption={handleOpenAddSubOption}
        onOpenManageTelas={(category, tool, subOption) => handleOpenManageTelas(tool.id, category, subOption)}
        onOpenEditTool={handleOpenEditTool}
        onOpenEditSubOption={handleOpenEditSubOption}
        onOpenConfirmSubOptionDelete={handleOpenConfirmSubOptionDelete}
        onOpenAddVariable={handleOpenAddVariable}
        onOpenEditVariable={handleOpenEditVariable}
        onOpenConfirmVariableDelete={handleOpenConfirmVariableDelete}
      />

      <AnimatePresence>
        {addToolModalState.isOpen && addToolModalState.category && (
          <AddToolModal
            onClose={() => setAddToolModalState({ isOpen: false, category: null, categoryTitle: '' })}
            onAdd={handleAddToolSubmit}
            categoryTitle={addToolModalState.categoryTitle}
          />
        )}
        {confirmToolDeleteModalState.isOpen && (
          <ConfirmationModal
            onCancel={() => setConfirmToolDeleteModalState({ isOpen: false, toolId: null, category: null, toolName: null })}
            onConfirm={handleConfirmToolDelete}
            message={`Tem certeza que deseja deletar a ferramenta "${confirmToolDeleteModalState.toolName || 'esta ferramenta'}"? Esta ação não pode ser desfeita.`}
            title="Confirmar Exclusão de Ferramenta"
          />
        )}
        {addSubOptionModalState.isOpen && addSubOptionModalState.tool && (
          <AddSubOptionModal
            onClose={() => setAddSubOptionModalState({ isOpen: false, tool: null })}
            onAdd={handleAddSubOptionSubmit}
            toolName={addSubOptionModalState.tool.name}
          />
        )}
        {manageTelasModalState.isOpen && manageTelasModalState.subOption && (
          <ManageTelasModal
            onClose={() => setManageTelasModalState({ isOpen: false, toolId: null, category: null, subOption: null })}
            subOption={manageTelasModalState.subOption}
            onSave={handleSaveTelas}
          />
        )}
        {editToolModalState.isOpen && editToolModalState.tool && (
          <EditToolModal
            onClose={() => setEditToolModalState({ isOpen: false, tool: null })}
            onSave={handleEditToolSave}
            tool={editToolModalState.tool}
          />
        )}
        {editSubOptionModalState?.isOpen && (
          <EditSubOptionModal 
            onClose={() => setEditSubOptionModalState(null)} 
            onSave={handleEditSubOptionSave} 
            subOption={editSubOptionModalState.subOption} 
          />
        )}
        {confirmSubOptionDeleteModalState?.isOpen && (
          <ConfirmationModal 
            onCancel={() => setConfirmSubOptionDeleteModalState(null)} 
            onConfirm={handleConfirmSubOptionDelete} 
            message={`Tem certeza que deseja deletar a sub-opção "${confirmSubOptionDeleteModalState.subOptionName || 'esta sub-opção'}"?`} 
            title="Confirmar Exclusão de Sub-Opção"
          />
        )}
        {addEditVariableModalState.isOpen && (
          <AddEditVariableModal
            onClose={() => setAddEditVariableModalState({ isOpen: false })}
            onSave={handleSaveVariable}
            existingVariable={addEditVariableModalState.variable}
          />
        )}
        {confirmVariableDeleteModalState.isOpen && (
          <ConfirmationModal
            onCancel={() => setConfirmVariableDeleteModalState({ isOpen: false, variableId: null, variableName: undefined })}
            onConfirm={handleConfirmVariableDelete}
            message={`Tem certeza que deseja deletar a variável "${confirmVariableDeleteModalState.variableName || 'esta variável'}"? Esta ação não pode ser desfeita.`}
            title="Confirmar Exclusão de Variável"
          />
        )}
      </AnimatePresence>
    </>
  );
}
