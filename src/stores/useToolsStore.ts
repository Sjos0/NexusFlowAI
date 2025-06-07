// src/stores/useToolsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tool, ToolCategory } from '@/lib/types';

// Helper para garantir que o localStorage só seja acessado no cliente
const isClient = typeof window !== 'undefined';

export interface ToolsState {
  triggers: Tool[];
  actions: Tool[];
  constraints: Tool[];
  addTool: (category: ToolCategory, tool: Tool) => void;
  removeTool: (category: ToolCategory, toolId: string) => void;
  updateTool: (category: ToolCategory, toolId: string, updatedTool: Partial<Tool>) => void;
}

export const useToolsStore = create<ToolsState>()(
  persist(
    (set) => ({
      triggers: [
        { id: '1', name: 'Chamada Recebida', subOptions: ['De qualquer número', 'De contato salvo', 'De número desconhecido'] },
        { id: '2', name: 'Nível da Bateria', subOptions: ['Abaixo de 15%', 'Abaixo de 50%', 'Carregando', 'Totalmente Carregada'] },
      ],
      actions: [
        { id: '3', name: 'Enviar Notificação', subOptions: ['Com som', 'Silenciosa'] },
        { id: '4', name: 'Abrir Aplicativo', subOptions: [] },
        { id: '6', name: 'Definir Volume', subOptions: ['Mudo', 'Vibrar', '50%', 'Máximo'] },
      ],
      constraints: [
        { id: '5', name: 'Dia da Semana', subOptions: ['Dias úteis', 'Fim de semana', 'Segunda-feira'] },
        { id: '7', name: 'Horário Específico', subOptions: []},
      ],

      addTool: (category: ToolCategory, tool: Tool) => {
        set((state) => ({
          [category]: [...state[category], tool],
        }));
      },

      removeTool: (category: ToolCategory, toolId: string) => {
        set((state) => ({
          [category]: state[category].filter((tool) => tool.id !== toolId),
        }));
      },
      
      updateTool: (category, toolId, updatedData) => {
        set((state) => ({
          [category]: state[category].map((tool) =>
            tool.id === toolId ? { ...tool, ...updatedData } : tool
          ),
        }));
      },
    }),
    {
      name: 'nexusflow-tools-storage',
      storage: isClient ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
      skipHydration: !isClient,
    }
  )
);

if (isClient) {
  useToolsStore.persist.rehydrate();
}
