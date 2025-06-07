// src/app/page.tsx
'use client'; 

import { useState, useEffect } from 'react';
import { ToolColumn } from "@/components/ToolColumn";
import { ToolCard } from "@/components/ToolCard";
import { AddToolModal } from '@/components/AddToolModal';
import { AIPromptArea } from '@/components/AIPromptArea';
import { Zap, Target, ShieldCheck } from "lucide-react";
import { useToolsStore } from '@/stores/useToolsStore';
import type { ToolCategory } from '@/lib/types';

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const { triggers, actions, constraints, addTool, removeTool } = useToolsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<ToolCategory | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleOpenModal = (category: ToolCategory) => {
    setModalCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalCategory(null);
  };

  const handleAddTool = (name: string, subOptions: string[]) => {
    if (modalCategory) {
      const newTool = { id: crypto.randomUUID(), name, subOptions };
      addTool(modalCategory, newTool);
    }
  };

  const categoryTitles: Record<ToolCategory, string> = {
    triggers: 'Gatilhos',
    actions: 'Ações',
    constraints: 'Restrições'
  };
  
  if (!hydrated) {
    return (
      <div className="flex flex-col h-screen bg-background p-4 lg:p-6 items-center justify-center">
        <p className="text-muted-foreground">Carregando NexusFlow...</p>
      </div>
    );
  }

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
          <ToolColumn title="Gatilhos" icon={Zap} onAdd={() => handleOpenModal('triggers')}>
            {triggers.map(tool => 
              <ToolCard key={tool.id} name={tool.name} subOptions={tool.subOptions} onDelete={() => removeTool('triggers', tool.id)} />
            )}
            {triggers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum gatilho adicionado.</p>}
          </ToolColumn>

          <ToolColumn title="Ações" icon={Target} onAdd={() => handleOpenModal('actions')}>
            {actions.map(tool => 
              <ToolCard key={tool.id} name={tool.name} subOptions={tool.subOptions} onDelete={() => removeTool('actions', tool.id)} />
            )}
             {actions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma ação adicionada.</p>}
          </ToolColumn>

          <ToolColumn title="Restrições" icon={ShieldCheck} onAdd={() => handleOpenModal('constraints')}>
            {constraints.map(tool => 
              <ToolCard key={tool.id} name={tool.name} subOptions={tool.subOptions} onDelete={() => removeTool('constraints', tool.id)} />
            )}
            {constraints.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma restrição adicionada.</p>}
          </ToolColumn>
        </div>

        <footer className="mt-6">
          <AIPromptArea />
        </footer>
      </main>

      {isModalOpen && modalCategory && (
        <AddToolModal
          onClose={handleCloseModal}
          onAdd={handleAddTool}
          categoryTitle={categoryTitles[modalCategory]}
        />
      )}
    </>
  );
}
