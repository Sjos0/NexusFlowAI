// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
// Component Imports
import { AddToolModal } from '@/components/AddToolModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { AddSubOptionModal } from '@/components/AddSubOptionModal';
import { AIPromptArea } from '@/components/AIPromptArea';
import { KnowledgeBasePanel } from '@/components/KnowledgeBasePanel'; // Import new panel
// Util & Hook Imports
import { useToolsStore } from '@/stores/useToolsStore';
import type { ToolCategory, Tool } from '@/lib/types'; // Ensure Tool is imported
import { BotMessageSquare } from 'lucide-react'; // New Icon
import { Button } from "@/components/ui/button"; // For consistent button styling

export default function Home() {
  const { hydrate, updateTool, removeTool, addTool } = useToolsStore();

  // On initial mount, call hydrate() to load data from localStorage.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // State for Modals
  const [addToolModalOpen, setAddToolModalOpen] = useState(false);
  const [currentCategoryForAdd, setCurrentCategoryForAdd] = useState<ToolCategory | null>(null);

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; tool: Tool | null; category: ToolCategory | null }>({ isOpen: false, tool: null, category: null });
  const [addSubOptionModal, setAddSubOptionModal] = useState<{ isOpen: boolean; tool: Tool | null; category: ToolCategory | null }>({ isOpen: false, tool: null, category: null });
  const [isKbOpen, setIsKbOpen] = useState(false); // State for Knowledge Base Panel

  const categoryTitles: Record<ToolCategory, string> = {
    triggers: 'Gatilhos',
    actions: 'Ações',
    constraints: 'Restrições'
  };
  
  // === Handlers for Modals (to be passed to KnowledgeBasePanel) ===
   const handleOpenAddToolModal = (category: ToolCategory) => {
    setCurrentCategoryForAdd(category);
    setAddToolModalOpen(true);
  };

  const handleAddToolSubmit = (name: string, subOptions: string[]) => {
    if (currentCategoryForAdd) {
      addTool(currentCategoryForAdd, { id: crypto.randomUUID(), name, subOptions });
    }
    setAddToolModalOpen(false);
    setCurrentCategoryForAdd(null);
  };
  
  const handleOpenConfirmDelete = (category: ToolCategory, tool: Tool) => {
    setConfirmModal({ isOpen: true, tool, category });
  };

  const handleConfirmDelete = () => {
    if (confirmModal.tool && confirmModal.category) {
      removeTool(confirmModal.category, confirmModal.tool.id);
    }
    setConfirmModal({ isOpen: false, tool: null, category: null });
  };

  const handleOpenAddSubOption = (category: ToolCategory, tool: Tool) => {
    setAddSubOptionModal({ isOpen: true, tool, category });
  };

  const handleAddSubOptionSubmit = (newSubOptions: string[]) => {
    if (addSubOptionModal.tool && addSubOptionModal.category) {
      const { id, subOptions: existingSubOptions } = addSubOptionModal.tool;
      const category = addSubOptionModal.category;
      
      const combinedOptions = [...existingSubOptions];
      newSubOptions.forEach(newOpt => {
        if (!combinedOptions.includes(newOpt)) {
          combinedOptions.push(newOpt);
        }
      });
      
      updateTool(category, id, { subOptions: combinedOptions });
    }
    setAddSubOptionModal({ isOpen: false, tool: null, category: null });
  };


  return (
    <>
      <main className="flex flex-col h-screen bg-background p-4 lg:p-6 overflow-hidden">
        <header className="flex justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h1 className="font-headline text-3xl font-bold">
              <span className="bg-gradient-to-r from-accent to-accent-end bg-clip-text text-transparent">
                NexusFlow
              </span>
            </h1>
            <p className="text-muted-foreground">Seu co-piloto de automação para MacroDroid</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => setIsKbOpen(true)}
            className="font-semibold"
          >
            <BotMessageSquare className="mr-2 h-5 w-5" />
            Banco de Conhecimento
          </Button>
        </header>
        
        {/* The main content area is now dedicated to the chat interface */}
        {/* Added flex-grow to AIPromptArea container for it to take available space */}
        <div className="flex-grow flex justify-center items-stretch"> 
          <AIPromptArea />
        </div>
      </main>

      <KnowledgeBasePanel 
        isOpen={isKbOpen} 
        onClose={() => setIsKbOpen(false)}
        onOpenAddTool={handleOpenAddToolModal}
        onOpenConfirmDelete={handleOpenConfirmDelete}
        onOpenAddSubOption={handleOpenAddSubOption}
      />

      <AnimatePresence>
        {addToolModalOpen && currentCategoryForAdd && (
          <AddToolModal
            onClose={() => { setAddToolModalOpen(false); setCurrentCategoryForAdd(null);}}
            onAdd={handleAddToolSubmit}
            categoryTitle={categoryTitles[currentCategoryForAdd]}
          />
        )}
        {confirmModal.isOpen && (
          <ConfirmationModal
            onCancel={() => setConfirmModal({ isOpen: false, tool: null, category: null })}
            onConfirm={handleConfirmDelete}
            message={`Tem certeza que deseja deletar a ferramenta "${confirmModal.tool?.name || 'esta ferramenta'}"? Esta ação não pode ser desfeita.`}
            title="Confirmar Exclusão"
          />
        )}
        {addSubOptionModal.isOpen && addSubOptionModal.tool && addSubOptionModal.category && (
          <AddSubOptionModal
            onClose={() => setAddSubOptionModal({ isOpen: false, tool: null, category: null })}
            onAdd={handleAddSubOptionSubmit}
            toolName={addSubOptionModal.tool.name}
          />
        )}
      </AnimatePresence>
    </>
  );
}
