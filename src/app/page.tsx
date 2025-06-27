// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
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
  AddEditVariableModal,
  ImportConfigModal
} from '@/components';
// Util & Hook Imports
import { useToolsStore } from '@/stores/useToolsStore';
import type { ToolCategory, Tool, SubOption, Tela, Variable } from '@/lib/types';
import { Book } from 'lucide-react';
import { generateKnowledgeBaseText } from '@/lib/kbManager';
import { StoredState } from '@/stores/useToolsStore';
import { useHasMounted } from '@/hooks/useHasMounted';

export default function Home() {
  const store = useToolsStore();
  const { 
    overwriteState, 
    triggers, 
    actions, 
    constraints, 
    variables,
    addTool,
    removeTool,
    updateTool,
    addVariable,
    removeVariable,
    updateVariable,
    hydrate 
  } = store;
  
  const hasMounted = useHasMounted();

  useEffect(() => { 
    if (hasMounted) {
      hydrate(); 
    }
  }, [hasMounted, hydrate]);

  // State for Modals
  const [addToolModalState, setAddToolModalState] = useState<{ isOpen: boolean; category: ToolCategory | null; categoryTitle: string }>({ isOpen: false, category: null, categoryTitle: '' });
  const [confirmToolDeleteModalState, setConfirmToolDeleteModalState] = useState<{ isOpen: boolean; toolId: string | null; category: ToolCategory | null; toolName: string | null }>({ isOpen: false, toolId: null, category: null, toolName: null });
  const [addSubOptionModalState, setAddSubOptionModalState] = useState<{ isOpen: boolean; tool: (Tool & { category: ToolCategory }) | null }>({ isOpen: false, tool: null });
  
  const [manageTelasModal, setManageTelasModal] = useState<{
    isOpen: boolean;
    toolId: string;
    category: ToolCategory;
    subOptionId: string;
  } | null>(null);

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
  
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
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
    setManageTelasModal({ isOpen: true, toolId, category, subOptionId: subOption.id });
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

  // --- New Copy/Paste Handlers ---
  const handleCopy = () => {
    const dataToCopy: StoredState = {
      triggers,
      actions,
      constraints,
      variables,
    };
    const textToCopy = generateKnowledgeBaseText(dataToCopy);
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast.success('Configuração copiada para a área de transferência!');
      })
      .catch(err => {
        toast.error('Falha ao copiar. Verifique as permissões do navegador.');
        console.error('Falha ao copiar texto: ', err);
      });
  };

  const handlePaste = () => {
    setIsPasteModalOpen(true);
  };

  return (
    <>
      <main className="flex flex-col h-[100dvh] bg-background">
        
        <header className="flex justify-between items-center p-4 lg:p-6 border-b border-border flex-shrink-0">
          <div>
            <h1 className="font-headline text-2xl font-bold bg-gradient-to-r from-accent to-accent-end bg-clip-text text-transparent">
              NexusFlow
            </h1>
            <p className="text-muted-foreground text-sm">Seu co-piloto de automação para MacroDroid</p>
          </div>
          <button 
            onClick={() => setIsKbOpen(true)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-background"
            aria-label="Abrir Banco de Conhecimento"
          >
            <Book size={24} />
          </button>
        </header>
        
        <div className="flex-grow overflow-hidden flex justify-center">
          <AIPromptArea />
        </div>

      </main>

      <KnowledgeBasePanel 
        isOpen={isKbOpen} 
        onClose={() => setIsKbOpen(false)}
        onOpenAddTool={handleOpenAddToolModal}
        onOpenConfirmToolDelete={handleOpenConfirmToolDelete}
        onOpenAddSubOption={handleOpenAddSubOption}
        onOpenManageTelas={handleOpenManageTelas}
        onOpenEditTool={handleOpenEditTool}
        onOpenEditSubOption={handleOpenEditSubOption}
        onOpenConfirmSubOptionDelete={handleOpenConfirmSubOptionDelete}
        onOpenAddVariable={handleOpenAddVariable}
        onOpenEditVariable={handleOpenEditVariable}
        onOpenConfirmVariableDelete={handleOpenConfirmVariableDelete}
        onCopy={handleCopy}
        onPaste={handlePaste}
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
        {manageTelasModal?.isOpen && (
          <ManageTelasModal
            onClose={() => setManageTelasModal(null)}
            toolId={manageTelasModal.toolId}
            category={manageTelasModal.category}
            subOptionId={manageTelasModal.subOptionId}
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
        {isPasteModalOpen && (
          <ImportConfigModal
            onClose={() => setIsPasteModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
