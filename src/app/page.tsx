// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Component Imports
import { ToolColumn } from "@/components/ToolColumn";
import { ToolCard } from "@/components/ToolCard";
import { AddToolModal } from '@/components/AddToolModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { AddSubOptionModal } from '@/components/AddSubOptionModal';
import { AIPromptArea } from '@/components/AIPromptArea';
// Util & Hook Imports
import { useToolsStore } from '@/stores/useToolsStore';
import type { ToolCategory, Tool } from '@/lib/types';
import { Zap, Target, ShieldCheck } from "lucide-react";

export default function Home() {
  const { triggers, actions, constraints, addTool, removeTool, updateTool, hydrate } = useToolsStore();

  // On initial mount, call hydrate() to load data from localStorage.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // State for Modals
  const [addToolModalOpen, setAddToolModalOpen] = useState(false);
  const [currentCategoryForAdd, setCurrentCategoryForAdd] = useState<ToolCategory | null>(null);

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; toolId: string | null; category: ToolCategory | null; toolName: string | null }>({ isOpen: false, toolId: null, category: null, toolName: null });
  const [addSubOptionModal, setAddSubOptionModal] = useState<{ isOpen: boolean; tool: Tool | null; category: ToolCategory | null }>({ isOpen: false, tool: null, category: null });
  
  const categoryTitles: Record<ToolCategory, string> = {
    triggers: 'Gatilhos',
    actions: 'Ações',
    constraints: 'Restrições'
  };

  // === Handlers for Modals ===
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
    setConfirmModal({ isOpen: true, toolId: tool.id, category, toolName: tool.name });
  };

  const handleConfirmDelete = () => {
    if (confirmModal.toolId && confirmModal.category) {
      removeTool(confirmModal.category, confirmModal.toolId);
    }
    setConfirmModal({ isOpen: false, toolId: null, category: null, toolName: null });
  };

  const handleOpenAddSubOption = (category: ToolCategory, tool: Tool) => {
    setAddSubOptionModal({ isOpen: true, tool, category });
  };

  const handleAddSubOptionSubmit = (newSubOption: string) => {
    if (addSubOptionModal.tool && addSubOptionModal.category) {
      const { id, subOptions } = addSubOptionModal.tool;
      const category = addSubOptionModal.category;
      updateTool(category, id, { subOptions: [...subOptions, newSubOption] });
    }
    setAddSubOptionModal({ isOpen: false, tool: null, category: null });
  };
  
  // Initial check for hydration
  const [isHydrated, setIsHydrated] = useState(useToolsStore.getState().triggers.length > 0 || useToolsStore.getState().actions.length > 0 || useToolsStore.getState().constraints.length > 0);

  useEffect(() => {
    const unsubscribe = useToolsStore.subscribe(
      (state) => setIsHydrated(state.triggers.length > 0 || state.actions.length > 0 || state.constraints.length > 0 || !!Object.keys(state).find(key => (state[key as keyof typeof state] as any[]).length > 0)) // a bit more robust check
    );
    // If initial load from localStorage populated the store, reflect that
    if (useToolsStore.getState().triggers.length > 0 || useToolsStore.getState().actions.length > 0 || useToolsStore.getState().constraints.length > 0) {
        setIsHydrated(true);
    }
    return unsubscribe;
  }, []);


  const allColumns = [
    { title: "Gatilhos", icon: Zap, category: "triggers" as ToolCategory, data: triggers },
    { title: "Ações", icon: Target, category: "actions" as ToolCategory, data: actions },
    { title: "Restrições", icon: ShieldCheck, category: "constraints" as ToolCategory, data: constraints },
  ];

  return (
    <>
      <main className="flex flex-col h-screen bg-background p-4 lg:p-6">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="font-headline text-3xl font-bold">
              <span className="bg-gradient-to-r from-accent to-accent-end bg-clip-text text-transparent">
                NexusFlow
              </span>
            </h1>
            <p className="text-muted-foreground">Seu planejador de automação para MacroDroid</p>
          </div>
        </header>
        
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
          {allColumns.map(({ title, icon, category, data }) => (
            <ToolColumn key={category} title={title} icon={icon} onAdd={() => handleOpenAddToolModal(category)}>
              <AnimatePresence>
                {data.length === 0 && (
                  <motion.p 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-sm text-muted-foreground text-center py-4"
                  >
                    Sem {title.toLowerCase()} definidos.
                  </motion.p>
                )}
                {data.map(tool => (
                  <motion.div 
                    key={tool.id} 
                    layout 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3 }}
                  >
                    <ToolCard
                      name={tool.name}
                      subOptions={tool.subOptions}
                      onDelete={() => handleOpenConfirmDelete(category, tool)}
                      onAddSubOption={() => handleOpenAddSubOption(category, tool)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </ToolColumn>
          ))}
        </div>
        <footer className="mt-6"><AIPromptArea /></footer>
      </main>

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
            onCancel={() => setConfirmModal({ isOpen: false, toolId: null, category: null, toolName: null })}
            onConfirm={handleConfirmDelete}
            message={`Tem certeza que deseja deletar a ferramenta "${confirmModal.toolName || 'esta ferramenta'}"? Esta ação não pode ser desfeita.`}
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
